import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import sunrise from '../assets/sunrise.png';
import sunset from '../assets/sunset.png';

const WINDOW_SIZE = 4;

const VetAppointment = () => {
  const { vetId } = useParams();
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
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
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          const day = date.getDate();
          const formatted = `${month}, ${day}`;
          const slotObj = avail.find(a => a.day === dayName);
          nextDates.push({ display: i === 0 ? 'Today' : formatted, value: dayName, date: formatted, slots: slotObj?.slots || [] });
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
  };

  const slideLeft = () => setWindowStart(ws => Math.max(0, ws - 1));
  const slideRight = () => setWindowStart(ws => Math.min(availableDates.length - WINDOW_SIZE, ws + 1));

  const getNextAvailableDate = () => {
    const idx = availableDates.findIndex(d => d.display === selectedDate);
    for (let i = idx + 1; i < availableDates.length; i++) {
      if (availableDates[i].slots.length > 0) {
        const nxt = availableDates[i];
        return `${nxt.value.slice(0,3)} ${nxt.date}`;
      }
    }
    return null;
  };

  if (loading) return <p className="text-center py-10">Loading vet details...</p>;
  if (!vet) return <p className="text-center py-10">Vet not found.</p>;

  const windowDates = availableDates.slice(windowStart, windowStart + WINDOW_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 pt-10">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-10">
            <div className="pb-4">
                <h2 className="text-xl font-bold text-gray-800">{vet.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                <Video className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-gray-600">Online Video Consultation</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-2">Fee: Rs. {vet.services?.[0]?.price || '1,600'}</p>
            </div>
        </div>
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-5">
            <div className="mt-6 flex items-center border-b gap-2">
                <button onClick={slideLeft} disabled={windowStart === 0} className="p-2">
                <ChevronLeft />
                </button>
                <div className="flex">
                {windowDates.map(day => (
                    <button
                    key={day.display}
                    onClick={() => handleDateSelect(day.display)}
                    className={`w-40 py-2 text-sm pb-4 justify-center whitespace-nowrap flex items-center gap-3 ${
                        selectedDate === day.display
                        ? 'text-orange-400 border-b-4 border-orange-400 transition-all duration-500 '
                        : 'bg-white '
                    }`}
                    >
                    <Calendar className="w-4 h-4" />
                    {day.display}
                    </button>
                ))}
                </div>
                <button onClick={slideRight} disabled={windowStart >= availableDates.length - WINDOW_SIZE} className="p-2">
                <ChevronRight />
                </button>
            </div>

            {selectedDate && (
                <div className="mt-6 space-y-4">
                {morningSlots.length > 0 && (
                    <div>
                    <p className="text-xs font-medium text-gray-400 ml-3 flex items-center">
                        <img src={sunrise} alt="Sunrise" className="w-6 h-6 mr-4" />
                        Morning Slots
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        {morningSlots.map((slot, i) => {
                        const sel = selectedSlot === slot.startTime;
                        return (
                            <button
                            key={i}
                            onClick={() => setSelectedSlot(slot.startTime)}
                            className={`px-3 py-2 bg-white border font-normal border-gray-200 rounded-lg text-sm transition-all duration-500 ${
                                sel
                                ? 'text-orange-400 border-orange-400 bg-orange-100'
                                : 'hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100'
                            }`}
                            >
                            {slot.startTime}
                            </button>
                        );
                        })}
                    </div>
                    </div>
                )}
                {afternoonSlots.length > 0 && (
                    <div>
                    <p className="text-xs font-medium text-gray-400 ml-3 flex items-center">
                        <img src={sunset} alt="Sunrise" className="w-6 h-6 mr-4" />
                        Afternoon Slots
                    </p>
                    <div className="grid grid-cols-5 gap-4 mt-4 px-10">
                        {afternoonSlots.map((slot, i) => {
                        const sel = selectedSlot === slot.startTime;
                        return (
                            <button
                            key={i}
                            onClick={() => setSelectedSlot(slot.startTime)}
                            className={`px-3 py-2 bg-white border font-normal border-gray-200 rounded-lg text-sm transition-all duration-500 ${
                                sel
                                ? 'text-orange-400 border-orange-400 bg-orange-100'
                                : 'hover:text-orange-400 hover:border-orange-400 hover:bg-orange-100'
                            }`}
                            >
                            {slot.startTime}
                            </button>
                        );
                        })}
                    </div>
                    </div>
                )}
                {morningSlots.length === 0 && afternoonSlots.length === 0 && (
                    <div className="text-center py-4">
                    <p className="text-sm font-medium">No free slots available for selected date</p>
                    {getNextAvailableDate() && (
                        <p className="text-teal-700 text-sm font-medium w-fit rounded-md px-14 mx-auto mt-3 p-3 border border-teal-700">Next Availability on {getNextAvailableDate()}</p>
                    )}
                    </div>
                )}
                </div>
            )}

            <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-gray-800">Reviews About {vet.name.split(' ')[0]} (556)</h3>
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <ThumbsUp className="w-4 h-4 text-teal-600" />
                <span>I recommend the doctor</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VetAppointment;
