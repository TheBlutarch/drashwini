# Doctor Appointment Booking Flow & Slots API - Developer & LLM Integration Guide

This guide provides a comprehensive, self-contained reference for software engineers and LLM agents implementing or integrating the complete **Doctor Appointment Booking Flow** (including real-time slot fetching, disabling past/booked slots, step-by-step UI state management, and booking submission) into medical/clinic applications.

---

## 1. Overview & Architecture

The booking flow follows a multi-step wizard state machine:

1. **Step 1: Appointment Type Selection** - In-Clinic (`consultation`) vs. Tele-Consultation (`consultation_vc`).
2. **Step 2: Date Selection** - Choose an appointment date (prevents past date selection).
3. **Step 3: Time Slot Fetching & Display** - Query API range endpoint, parse available/booked slots, disable past & booked time slots, handle selection state.
4. **Step 4: Patient Details** - Name, Phone (10-digit validation), Email, Gender, and Medical Notes.
5. **Step 5: Payment & Confirmation** - Display booking summary, process payment method (e.g. Pay at Clinic / Online), and submit booking.

---

## 2. API Reference (`GET /api/v1/appointments/slots/range`)

* **Base Endpoint**: `https://b2b.medcortico.com/api/v1/appointments/slots/range`
* **Authentication**: None required (Public Endpoint).
* **Purpose**: Fetches available and booked time slots for a specific practitioner over a date range.

### Query Parameters

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `practitioner` | string | **Yes** | ERPNext Healthcare Practitioner ID | `HLC-PRAC-2026-00001` |
| `start_date` | string | **Yes** | Start date in `YYYY-MM-DD` format | `2026-07-28` |
| `end_date` | string | **Yes** | End date in `YYYY-MM-DD` format | `2026-07-28` |
| `appointment_type` | string | No | Filter by appointment type (`consultation` for In-Clinic, `consultation_vc` for Tele-Consultation) | `consultation` |
| `duration` | integer | No | Slot interval in minutes (15, 30, 45, 60). Default: `15` | `15` |

---

## 3. Response Schema

```json
{
  "success": true,
  "practitioner": "HLC-PRAC-2026-00001",
  "start_date": "2026-07-28",
  "end_date": "2026-07-28",
  "slots_by_date": {
    "2026-07-28": {
      "success": true,
      "date": "2026-07-28",
      "day_of_week": "Tuesday",
      "available_slots": [
        {
          "start_time": "12:00:00",
          "end_time": "12:15:00",
          "start_datetime": "2026-07-28T12:00:00",
          "end_datetime": "2026-07-28T12:15:00",
          "available": true,
          "appointment_type": "consultation"
        }
      ],
      "booked_slots": [
        {
          "start_time": "12:15:00",
          "end_time": "12:30:00",
          "start_datetime": "2026-07-28T12:15:00",
          "end_datetime": "2026-07-28T12:30:00",
          "patient": "PAT-00012",
          "status": "Scheduled"
        }
      ],
      "total_slots": 20,
      "available_count": 19,
      "booked_count": 1,
      "duration_minutes": 15
    }
  }
}
```

---

## 4. Slot Fetching, Filtering & Display Logic

To ensure a seamless user experience and prevent double bookings or invalid bookings for time slots that have already passed:

1. **Merge & Chronologically Sort**: Combine `available_slots` (flagged with `isBooked = false`) and `booked_slots` (flagged with `isBooked = true`). Sort by `start_time`.
2. **Past Slot Validation**: Compare each slot's full ISO/date timestamp against current client time (`new Date()`). If `slotDateTime < currentTime`, mark the slot as `isPast = true`.
3. **Disabling Interactive Elements**: If `slot.isBooked || isPast`:
   - Apply `.disabled` visual class (`opacity: 0.35`, `cursor: not-allowed`, `text-decoration: line-through`).
   - Set informative tooltip titles (`"Slot Already Booked"` or `"Slot Time Passed"`).
   - Prevent click listeners from attaching/firing.
4. **Active Selection**: Store the selected formatted time (e.g. `"12:00 PM"`) and raw ISO start time (`"12:00:00"`) in the booking state.

---

## 5. Complete Reference Implementation (Vanilla JS)

```javascript
// 1. Time Formatter Helper ("13:30:00" -> "01:30 PM")
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

// 2. Booking State Object
const bookingState = {
  type: 'in-clinic',          // 'in-clinic' | 'tele-consultation'
  date: '2026-07-28',         // 'YYYY-MM-DD'
  time: '',                   // '12:00 PM'
  rawTime: '',                // '12:00:00'
  name: '',
  phone: '',
  email: '',
  gender: '',
  notes: ''
};

// 3. Fetch and Render Slots
async function fetchAndRenderSlots({
  containerElement,
  practitionerId = 'HLC-PRAC-2026-00001',
  selectedDate,
  isTeleConsultation = false,
  duration = 15,
  onSlotSelect
}) {
  if (!selectedDate) {
    containerElement.innerHTML = '<p class="muted">Please select a date to view time slots.</p>';
    return;
  }

  containerElement.innerHTML = `
    <div class="slots-loading">
      <span>Fetching available slots...</span>
    </div>
  `;

  const appointmentType = isTeleConsultation ? 'consultation_vc' : 'consultation';
  const url = `https://b2b.medcortico.com/api/v1/appointments/slots/range`
    + `?practitioner=${encodeURIComponent(practitionerId)}`
    + `&start_date=${encodeURIComponent(selectedDate)}`
    + `&end_date=${encodeURIComponent(selectedDate)}`
    + `&appointment_type=${encodeURIComponent(appointmentType)}`
    + `&duration=${duration}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    containerElement.innerHTML = '';

    const dayData = data.slots_by_date && data.slots_by_date[selectedDate];
    const availableSlots = (dayData && dayData.available_slots) || [];
    const bookedSlots = (dayData && dayData.booked_slots) || [];

    if (availableSlots.length === 0 && bookedSlots.length === 0) {
      containerElement.innerHTML = '<p class="muted">No slots available for this date.</p>';
      return;
    }

    // Combine available & booked slots, sorted chronologically
    const allSlots = [
      ...availableSlots.map(s => ({ ...s, isBooked: false })),
      ...bookedSlots.map(s => ({ ...s, isBooked: true }))
    ].sort((a, b) => a.start_time.localeCompare(b.start_time));

    const now = new Date();

    allSlots.forEach(slot => {
      const btn = document.createElement('button');
      const formattedTime = formatTime12h(slot.start_time);
      btn.className = 'slot-btn';
      btn.textContent = formattedTime;

      // Determine full date-time of slot
      let slotDateTime;
      if (slot.start_time && slot.start_time.includes('T')) {
        slotDateTime = new Date(slot.start_time);
      } else {
        slotDateTime = new Date(`${selectedDate}T${slot.start_time}`);
      }

      const isPast = !isNaN(slotDateTime.getTime()) && slotDateTime < now;

      if (slot.isBooked || isPast) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btn.title = slot.isBooked ? 'Slot Already Booked' : 'Slot Time Passed';
      } else {
        if (bookingState.time === formattedTime) {
          btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
          containerElement.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          bookingState.time = formattedTime;
          bookingState.rawTime = slot.start_time;
          if (onSlotSelect) onSlotSelect(formattedTime, slot.start_time);
        });
      }

      containerElement.appendChild(btn);
    });
  } catch (err) {
    console.error('Error fetching slots:', err);
    containerElement.innerHTML = '<p class="error">Failed to load time slots. Please try again.</p>';
  }
}
```

---

## 6. CSS Layout & States

```css
.slots-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 1rem;
}

.slot-btn {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.slot-btn:hover:not(.disabled):not(.selected) {
  border-color: #0d9488;
  background: rgba(13, 148, 136, 0.05);
}

.slot-btn.selected {
  background: #0d9488;
  color: #ffffff;
  border-color: #0d9488;
}

.slot-btn.disabled {
  opacity: 0.35;
  background: #f1f5f9;
  cursor: not-allowed;
  text-decoration: line-through;
  border-color: #cbd5e1;
}
```

---

## 7. Step-by-Step Validation Rules

Before advancing between wizard steps, enforce the following validation logic:

1. **Step 1 (Type)**: Ensure `bookingState.type` is chosen (`in-clinic` or `tele-consultation`).
2. **Step 2 (Date)**: Ensure `bookingState.date` is set and is not prior to today's date.
3. **Step 3 (Slot)**: Ensure `bookingState.time` is selected.
4. **Step 4 (Patient Details)**:
   - **Name**: Required (non-empty string).
   - **Phone**: Required, valid 10-digit number (`/^[0-9]{10}$/`).
   - **Email**: Required, valid email pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
   - **Gender**: Required selection (e.g. Male, Female, Other).

---

## 8. Prompting Instructions for LLM Agents

When instructing another LLM agent to implement or replicate this booking flow and slot display, provide the following concise prompt:

```text
Implement the Doctor Appointment Booking Flow and Real-time Slot Display:

API Specification:
- Endpoint: GET https://b2b.medcortico.com/api/v1/appointments/slots/range
- Params: practitioner={PRACTITIONER_ID}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}&appointment_type={TYPE_ID}&duration=15
- Mapping: appointment_type is 'consultation' for In-Clinic OPD and 'consultation_vc' for Tele-Consultation.

Slot Render & Filtering Rules:
1. Merge response `available_slots` and `booked_slots` from `response.slots_by_date[selectedDate]`.
2. Sort all slots chronologically by `start_time`.
3. Evaluate slot time against current datetime. If the slot has passed today (`slotDateTime < now`), mark it as past.
4. Render `booked_slots` and past slots with class `disabled` (`disabled` attribute, `text-decoration: line-through`, non-clickable).
5. Format displayed times from 24h `HH:MM:SS` to 12h `hh:mm AM/PM`.
6. Enforce step-by-step wizard validation (Type selection -> Date selection -> Slot selection -> Patient form validation -> Confirmation).
```

