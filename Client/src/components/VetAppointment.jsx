import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Video, Calendar, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import sunrise from '../assets/sunrise.png';
import sunset from '../assets/sunset.png';
import eveningIcon from '../assets/evening.png';

const WINDOW_SIZE = 4;

const VetAppointment = () => {
  const { vetId } = useParams();
  const navigate = useNavigate();

  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [windowStart, setWindowStart] = useState(0);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIsoDate, setSelectedIsoDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [morningSlots, setMorningSlots] = useState([]);
  const [afternoonSlots, setAfternoonSlots] = useState([]);
  const [eveningSlots, setEveningSlots] = useState([]);

  useEffect(() => {
    const fetchVet = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/auth/vets/${vetId}`,
          { withCredentials: true }
        );
        setVet(data.vet);

        // build the next 30 days array, each with ALL slots for that weekday
        const today = new Date();
        const avail = data.vet.services?.[0]?.availability || [];
        const nextDates = [];

        for (let i = 0; i < 30; i++) {
          const dt = new Date(today);
          dt.setDate(today.getDate() + i);
          const iso = dt.toISOString().split('T')[0];
          const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
          const month = dt.toLocaleDateString('en-US', { month: 'short' });
          const dayNum = dt.getDate();
          const label = i === 0 ? 'Today' : `${month}, ${dayNum}`;

          // --- NEW: collect all availability entries for this weekday ---
          const matchingDays = avail.filter(a => a.day === dayName);
          const allSlots = matchingDays.reduce(
            (acc, block) => acc.concat(block.slots || []),
            []
          );

          nextDates.push({
            display: label,
            isoDate: iso,
            slots: allSlots
          });
        }

        setAvailableDates(nextDates);

        // auto-pick first day that actually has slots
        const firstWithSlots = nextDates.find(d => d.slots.length) || nextDates[0];
        handleDateSelect(firstWithSlots.display, nextDates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVet();
  }, [vetId]);

  // normalize meridiem strings to standard “AM”/“PM”
  const normalizeMeridiem = m => m.trim().toUpperCase().replace(/\./g, '');

  const handleDateSelect = (display, list = availableDates) => {
    setSelectedDate(display);
    setSelectedSlot(null);

    const dateObj = list.find(d => d.display === display) || {};
    setSelectedIsoDate(dateObj.isoDate || null);

    let slots = dateObj.slots || [];
    console.log('[DEBUG] all slots for', display, slots);

    // if “Today”, strip out any that start earlier than now
    if (display === 'Today') {
      const now = new Date();
      slots = slots.filter(s => {
        let [t, mer] = s.startTime.split(' ');
        mer = normalizeMeridiem(mer);
        let [h, m] = t.split(':').map(Number);
        if (mer === 'PM' && h !== 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;
        const slotDate = new Date(now);
        slotDate.setHours(h, m, 0, 0);
        return slotDate > now;
      });
    }

    // categorize
    const morn = [], aft = [], eve = [];
    slots.forEach(s => {
      let [t, mer] = s.startTime.split(' ');
      mer = normalizeMeridiem(mer);
      let [h] = t.split(':').map(Number);
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;

      if (h < 12) morn.push(s);
      else if (h < 17) aft.push(s);
      else eve.push(s);
    });

    setMorningSlots(morn);
    setAfternoonSlots(aft);
    setEveningSlots(eve);

    // adjust scroll window
    const idx = list.findIndex(d => d.display === display);
    if (idx < windowStart) setWindowStart(idx);
    else if (idx >= windowStart + WINDOW_SIZE)
      setWindowStart(idx - WINDOW_SIZE + 1);
  };

  const handlePrev = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx > 0) handleDateSelect(availableDates[idx - 1].display);
  };
  const handleNext = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx < availableDates.length - 1)
      handleDateSelect(availableDates[idx + 1].display);
  };

  const handleBooking = async () => {
    if (!selectedIsoDate || !selectedSlot) {
      return alert('Please select both a date and a time slot');
    }
    try {
      // --- NEW: include evening in the lookup too ---
      const all = [...morningSlots, ...afternoonSlots, ...eveningSlots];
      const slotObj = all.find(s => s.startTime === selectedSlot);

      await axios.post(
        `http://localhost:5000/auth/appointments/${vetId}`,
        {
          date: selectedIsoDate,
          startTime: slotObj.startTime,
          endTime: slotObj.endTime,
          fee: vet.services?.[0]?.price,
          consultationType: 'video'
        },
        { withCredentials: true }
      );
      alert('Appointment created. Proceed to payment.');
      // navigate(`/payment/${vetId}`);
    } catch (e) {
      console.error(e);
      alert('Failed to book appointment');
    }
  };

  const getNextAvailability = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    for (let i = idx + 1; i < availableDates.length; i++) {
      if (availableDates[i].slots.length) {
        const d = new Date(availableDates[i].isoDate);
        return `${d.toLocaleString('default',{month:'short'})}, ${d.getDate()}`;
      }
    }
    return null;
  };

  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (!vet)    return <p className="text-center py-10">Vet not found.</p>;

  const windowDates = availableDates.slice(windowStart, windowStart + WINDOW_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      {/* Vet Info */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold">{vet.name}</h2>
        <div className="flex items-center gap-2 text-gray-600 mt-2">
          <Video className="w-4 h-4 text-teal-600" /> Video Consultation
        </div>
        <p className="mt-2 text-lg font-semibold">Fee: Rs. {vet.services?.[0]?.price}</p>
      </div>

      {/* Date Picker */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-5">
      <div className="flex items-center border-b pb-2 gap-2">
    <button onClick={handlePrev} className="p-2"><ChevronLeft/></button>

    {/* Scrollable dates with a thin, rounded teal scrollbar */}
    <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full">
      <div className="flex gap-2 whitespace-nowrap px-1">
        {windowDates.map(d => (
          <button
            key={d.display}
            onClick={() => handleDateSelect(d.display)}
            className={`
              flex-shrink-0 w-36 py-2 text-sm flex items-center justify-center gap-1
              ${selectedDate === d.display
                ? 'text-orange-400 border-b-4 border-orange-400 transition-all duration-300'
                : 'text-gray-600'}
            `}
          >
            <Calendar className="w-4 h-4" />
            {d.display}
          </button>
        ))}
      </div>
    </div>

    <button onClick={handleNext} className="p-2"><ChevronRight/></button>
  </div>

        {/* Slots */}
        {selectedDate && (
          <div className="mt-6 space-y-6">
            {morningSlots.length > 0 && (
              <div>
                <p className="flex items-center text-xs text-gray-400 mb-2">
                  <img src={sunrise} className="w-6 h-6 mr-2" alt="sunrise" /> Morning
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {morningSlots.map((s,i)=>(
                    <button
                      key={i}
                      onClick={()=>setSelectedSlot(s.startTime)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        selectedSlot===s.startTime
                          ? 'text-orange-400 border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                      }`}
                    >{s.startTime}</button>
                  ))}
                </div>
              </div>
            )}

            {afternoonSlots.length > 0 && (
              <div>
                <p className="flex items-center text-xs text-gray-400 mb-2">
                  <img src={sunset} className="w-6 h-6 mr-2" alt="sunset" /> Afternoon
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {afternoonSlots.map((s,i)=>(
                    <button
                      key={i}
                      onClick={()=>setSelectedSlot(s.startTime)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        selectedSlot===s.startTime
                          ? 'text-orange-400 border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                      }`}
                    >{s.startTime}</button>
                  ))}
                </div>
              </div>
            )}

            {eveningSlots.length > 0 && (
              <div>
                <p className="flex items-center text-xs text-gray-400 mb-2">
                  <img src={eveningIcon} className="w-5 h-5 mr-3" alt="evening" /> Evening
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {eveningSlots.map((s,i)=>(
                    <button
                      key={i}
                      onClick={()=>setSelectedSlot(s.startTime)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        selectedSlot===s.startTime
                          ? 'text-orange-400 border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100 transition-all duration-500'
                      }`}
                    >{s.startTime}</button>
                  ))}
                </div>
              </div>
            )}

            {(morningSlots.length===0 && afternoonSlots.length===0 && eveningSlots.length===0) && (
              <div className="text-center py-4">
                <p className="text-sm font-medium">No free slots available</p>
                {getNextAvailability() && (
                  <p className="mt-3 p-2 border border-teal-700 text-teal-700 text-sm font-medium inline-block rounded">
                    Next on {getNextAvailability()}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleBooking}
                className="w-1/3 py-2 mt-9 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg font-medium hover:opacity-90"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 border-t pt-4 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-800">
            Reviews About {vet.name.split(' ')[0]} (556)
          </h3>
          <div className="flex items-center gap-1 mt-2">
            <ThumbsUp className="w-4 h-4 text-teal-600" /> I recommend this doctor
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetAppointment;
