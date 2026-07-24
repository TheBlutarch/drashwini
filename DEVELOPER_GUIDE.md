# Doctor Appointment Slots API — Developer & LLM Integration Guide

This guide provides a lightweight, self-contained reference for developers and LLM agents integrating the Doctor Appointment Slots API (`GET /api/v1/appointments/slots/range`) into medical or clinic web applications.

---

## 1. Overview & Key Concepts

* **Base Endpoint**: `https://b2b.askdocse.com/api/v1/appointments/slots/range`
* **Authentication**: None required (Public Endpoint).
* **Purpose**: Fetches real-time available and booked time slots for a specific practitioner across a date range.
* **Core Rule for Double-Booking Prevention**: The API returns both `available_slots` and `booked_slots`. Frontend clients **must** visually disable and prevent click interactions on all `booked_slots`.

---

## 2. API Reference

### Request Format
`GET /api/v1/appointments/slots/range?practitioner={PRACTITIONER_ID}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}&appointment_type={TYPE_ID}&duration={MINUTES}`

### Query Parameters

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `practitioner` | string | **Yes** | ERPNext Healthcare Practitioner ID | `HLC-PRAC-2026-00001` |
| `start_date` | string | **Yes** | Start date in `YYYY-MM-DD` format | `2026-07-23` |
| `end_date` | string | **Yes** | End date in `YYYY-MM-DD` format | `2026-07-23` |
| `appointment_type` | string | No | Filter by appointment type ID (`{ID}` for In-Clinic, `{ID}_vc` for Tele-Consultation) | `HLC-PRAC-2026-00001` (In-Clinic)<br>`HLC-PRAC-2026-00001_vc` (Tele) |
| `duration` | integer | No | Slot interval in minutes (15, 30, 45, 60). Default: `30` | `15` |

---

## 3. API Response Structure

```json
{
  "success": true,
  "practitioner": "HLC-PRAC-2026-00001",
  "start_date": "2026-07-23",
  "end_date": "2026-07-23",
  "slots_by_date": {
    "2026-07-23": {
      "success": true,
      "date": "2026-07-23",
      "day_of_week": "Thursday",
      "available_slots": [
        {
          "start_time": "12:00:00",
          "end_time": "12:15:00",
          "start_datetime": "2026-07-23T12:00:00",
          "end_datetime": "2026-07-23T12:15:00",
          "available": true,
          "appointment_type": "HLC-PRAC-2026-00001"
        }
      ],
      "booked_slots": [
        {
          "start_time": "12:15:00",
          "end_time": "12:30:00",
          "start_datetime": "2026-07-23T12:15:00",
          "end_datetime": "2026-07-23T12:30:00",
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

## 4. Complete Reference Implementation (Vanilla JS)

Here is a copy-paste implementation for any frontend application:

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

// 2. Fetch and Render Slots
async function fetchAndRenderSlots({
  containerElement,
  practitionerId,
  selectedDate,       // 'YYYY-MM-DD'
  isTeleConsultation, // boolean
  duration = 15,
  onSlotSelect        // callback(timeStr)
}) {
  if (!selectedDate) {
    containerElement.innerHTML = '<p class="muted">Please select a date.</p>';
    return;
  }

  containerElement.innerHTML = '<p class="muted">Loading slots...</p>';

  const appointmentType = isTeleConsultation
    ? 'consultation_vc'
    : 'consultation';

  const url = `https://b2b.askdocse.com/api/v1/appointments/slots/range`
    + `?practitioner=${encodeURIComponent(practitionerId)}`
    + `&start_date=${selectedDate}`
    + `&end_date=${selectedDate}`
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

    // Combine available & booked slots and sort chronologically
    const allSlots = [
      ...availableSlots.map(s => ({ ...s, isBooked: false })),
      ...bookedSlots.map(s => ({ ...s, isBooked: true }))
    ].sort((a, b) => a.start_time.localeCompare(b.start_time));

    allSlots.forEach(slot => {
      const btn = document.createElement('div');
      const formattedTime = formatTime12h(slot.start_time);
      btn.className = 'slot-btn';
      btn.textContent = formattedTime;

      if (slot.isBooked) {
        // Visually disable booked slots
        btn.classList.add('disabled');
        btn.title = 'Slot Already Booked';
      } else {
        btn.addEventListener('click', () => {
          containerElement.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          if (onSlotSelect) onSlotSelect(formattedTime);
        });
      }

      containerElement.appendChild(btn);
    });
  } catch (err) {
    console.error('Error fetching slots:', err);
    containerElement.innerHTML = '<p class="error">Failed to load time slots.</p>';
  }
}
```

---

## 5. CSS Styling Guidelines

Ensure your frontend CSS handles available, selected, and disabled slot states cleanly:

```css
.slot-btn {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

/* Hover state for available slots */
.slot-btn:hover:not(.disabled):not(.selected) {
  border-color: #0d9488;
  background: rgba(13, 148, 136, 0.05);
}

/* Visually disabled booked slot */
.slot-btn.disabled {
  opacity: 0.35;
  background: #f1f5f9;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Active selection */
.slot-btn.selected {
  background: #0d9488;
  color: #ffffff;
  border-color: #0d9488;
}
```

---

## 6. Prompting Snippet for AI / LLM Agents

If you want an LLM agent to integrate this API into another site, use this prompt:

```text
Integrate the practitioner slots API endpoint:
GET https://b2b.askdocse.com/api/v1/appointments/slots/range?practitioner={PRACTITIONER_ID}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}&appointment_type={TYPE_ID}&duration=15

Rules:
1. Set start_date and end_date to the user's selected date.
2. Set appointment_type to `{PRACTITIONER_ID}` for in-clinic OPD and `{PRACTITIONER_ID}_vc` for tele-consultation.
3. Parse `available_slots` and `booked_slots` from `response.slots_by_date[date]`.
4. Render `booked_slots` with class `disabled` (unclickable) to prevent double booking.
5. Format times from "HH:MM:SS" (24h) to "hh:mm AM/PM" (12h).
```
