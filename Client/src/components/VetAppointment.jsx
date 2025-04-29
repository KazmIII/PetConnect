import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import sunrise from '../assets/sunrise.png';
import sunset from '../assets/sunset.png';

const WINDOW_SIZE = 4;

const VetAppointment = () => {
  const { vetId } = useParams();
  const navigate = useNavigate();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIsoDate, setSelectedIsoDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [windowStart, setWindowStart] = useState(0);
  const [morningSlots, setMorningSlots] = useState([]);
  const [afternoonSlots, setAfternoonSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchVetDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/auth/vets/${vetId}`, { withCredentials: true });
        setVet(data.vet);

        const today = new Date();
        const nextDates = [];
        const avail = data.vet.services?.[0]?.availability || [];
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const isoDate = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          const day = date.getDate();
          const formatted = `${month}, ${day}`;
          const slotObj = avail.find(a => a.day === dayName);
          nextDates.push({
            display: i === 0 ? 'Today' : formatted,
            value: dayName,
            isoDate,
            slots: slotObj?.slots || []
          });
        }
        setAvailableDates(nextDates);

        const first = nextDates.find(d => d.slots.length > 0) || nextDates[0];
        handleDateSelect(first.display, nextDates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVetDetails();
  }, [vetId]);

  const handleDateSelect = (display, datesArr = availableDates) => {
    setSelectedDate(display);
    setSelectedSlot(null);
    const dateObj = datesArr.find(d => d.display === display) || {};
    setSelectedIsoDate(dateObj.isoDate || null);
    let slots = dateObj.slots || [];

    if (display === 'Today') {
      const now = new Date();
      slots = slots.filter(s => {
        let [time, mer] = s.startTime.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (mer === 'PM' && h !== 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;
        const sd = new Date(now);
        sd.setHours(h, m, 0, 0);
        return sd > now;
      });
    }

    const morning = [];
    const afternoon = [];
    slots.forEach(s => {
      let [time, mer] = s.startTime.split(' ');
      let [h] = time.split(':').map(Number);
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      (h < 12 ? morning : afternoon).push(s);
    });

    setMorningSlots(morning);
    setAfternoonSlots(afternoon);

    const idx = datesArr.findIndex(d => d.display === display);
    if (idx < windowStart) setWindowStart(idx);
    else if (idx >= windowStart + WINDOW_SIZE) setWindowStart(idx - WINDOW_SIZE + 1);
  };

  const handlePrevDay = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx > 0) handleDateSelect(availableDates[idx - 1].display);
  };

  const handleNextDay = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    if (idx < availableDates.length - 1) handleDateSelect(availableDates[idx + 1].display);
  };

  const handleBooking = async () => {
    if (!selectedIsoDate || !selectedSlot) {
      alert('Please select a date and time slot');
      return;
    }
    try {
      const slotObj = [...morningSlots, ...afternoonSlots].find(s => s.startTime === selectedSlot);
      const payload = {
        date: selectedIsoDate,
        startTime: slotObj.startTime,
        endTime: slotObj.endTime,
        fee: vet.services?.[0]?.price,
        consultationType: 'video'
      };
      await axios.post(`http://localhost:5000/auth/appointments/${vetId}`,
        payload, { withCredentials: true 
      });
      alert('Appointment created. Proceed to payment.');
      // optionally navigate to payment
      //navigate(`/payment/${vetId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment');
    }
  };

  const getNextAvailableDate = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    for (let i = idx + 1; i < availableDates.length; i++) {
      if (availableDates[i].slots.length > 0) {
        const nxt = availableDates[i];
        return `${nxt.value.slice(0,3)} ${nxt.isoDate}`;
      }
    }
    return null;
  };

  if (loading) return <p className="text-center py-10">Loading vet details...</p>;
  if (!vet) return <p className="text-center py-10">Vet not found.</p>;

  const windowDates = availableDates.slice(windowStart, windowStart + WINDOW_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
      {/* Vet Info Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
        <h2 className="text-xl font-bold text-gray-800">{vet.name}</h2>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <Video className="w-4 h-4 text-teal-600" />
          Online Video Consultation
        </div>
        <p className="mt-2 text-lg font-semibold">Fee: Rs. {vet.services?.[0]?.price}</p>
      </div>

      {/* Date Selector */}
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-5">
        <div className="flex items-center border-b pb-2 gap-2">
          <button onClick={handlePrevDay} className="p-2"><ChevronLeft/></button>
          <div className="flex gap-2">
            {windowDates.map(day => (
              <button
                key={day.display}
                onClick={() => handleDateSelect(day.display)}
                className={`w-40 py-2 text-sm pb-4 flex items-center justify-center gap-2 whitespace-nowrap ${
                  selectedDate === day.display
                    ? 'text-orange-400 border-b-4 border-orange-400'
                    : 'text-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {day.display}
              </button>
            ))}
          </div>
          <button onClick={handleNextDay} className="p-2"><ChevronRight/></button>
        </div>

        {/* Slot Grids */}
        {selectedDate && (
          <div className="mt-6 space-y-6">
            {/* Morning */}
            {morningSlots.length>0 && <div>
              <p className="flex items-center text-xs text-gray-400 mb-2">
                <img src={sunrise} className="w-6 h-6 mr-2" alt="sunrise"/> Morning Slots
              </p>
              <div className="grid grid-cols-5 gap-2">
                {morningSlots.map((s,i)=>(
                  <button
                    key={i}
                    onClick={()=>setSelectedSlot(s.startTime)}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                      selectedSlot===s.startTime ? 'text-orange-400 border-orange-400 bg-orange-50' : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100'
                    }`}
                  >{s.startTime}</button>
                ))}
              </div>
            </div>}

            {/* Afternoon */}
            {afternoonSlots.length>0 && <div>
              <p className="flex items-center text-xs text-gray-400 mb-2">
                <img src={sunset} className="w-6 h-6 mr-2" alt="sunset"/> Afternoon Slots
              </p>
              <div className="grid grid-cols-5 gap-2">
                {afternoonSlots.map((s,i)=>(
                  <button
                    key={i}
                    onClick={()=>setSelectedSlot(s.startTime)}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                      selectedSlot===s.startTime ? 'text-orange-400 border-orange-400 bg-orange-50' : 'border-gray-200 hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100'
                    }`}
                  >{s.startTime}</button>
                ))}
              </div>
            </div>}

            {/* No Slots */}
            {morningSlots.length === 0 && afternoonSlots.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm font-medium">No free slots available for selected date</p>
                {getNextAvailableDate() && (
                  <p className="text-teal-700 text-sm font-medium w-fit rounded-md px-14 mx-auto mt-3 p-3 border border-teal-700">
                    Next Availability on {getNextAvailableDate()}
                  </p>
                )}
              </div>
            )}

            {/* Book Button */}
            <div className="flex justify-center">
              <button
                onClick={handleBooking}
                className="w-1/3 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg text-base font-medium hover:opacity-90"
              >Book Appointment</button>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8 border-t pt-4 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-800">Reviews About {vet.name.split(' ')[0]} (556)</h3>
          <div className="flex items-center gap-1 mt-2">
            <ThumbsUp className="w-4 h-4 text-teal-600" />
            I recommend the doctor
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetAppointment;
