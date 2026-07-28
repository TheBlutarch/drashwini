document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Scroll-Responsive Header
  // =========================================================================
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
        header.classList.remove('header-initial');
      } else {
        header.classList.remove('scrolled');
        header.classList.add('header-initial');
      }
    });
  }

  // =========================================================================
  // 2. Mobile Menu Toggle
  // =========================================================================
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
      const icon = navToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.className = 'ri-close-line';
        } else {
          icon.className = 'ri-menu-line';
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'ri-menu-line';
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'ri-menu-line';
      });
    });
  }

  // =========================================================================
  // 3. Testimonial Slider & Read More Toggle
  // =========================================================================
  const slider = document.querySelector('.reviews-slider');
  const slides = document.querySelectorAll('.review-slide');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');

  if (slider && slides.length > 0) {
    let currentSlide = 0;

    const updateSlider = () => {
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
      });
    }

    // Auto slide every 7 seconds
    let slideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateSlider();
    }, 7000);

    // Pause auto slide on button click
    const resetInterval = () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
      }, 7000);
    };

    if (prevBtn) prevBtn.addEventListener('click', resetInterval);
    if (nextBtn) nextBtn.addEventListener('click', resetInterval);
  }

  // Read More / Less Toggle for Reviews
  const readMoreButtons = document.querySelectorAll('.read-more-btn');
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const container = e.target.closest('.review-text-container');
      if (container) {
        const shortText = container.querySelector('.review-text-short');
        const fullText = container.querySelector('.review-text-full');

        if (fullText.style.display === 'inline' || fullText.style.display === 'block') {
          fullText.style.display = 'none';
          shortText.style.display = 'inline';
          e.target.textContent = 'Read More';
        } else {
          fullText.style.display = 'inline';
          shortText.style.display = 'none';
          e.target.textContent = 'Read Less';
        }
      }
    });
  });

  // =========================================================================
  // 4. Booking System Logic (Only runs on book.html)
  // =========================================================================
  const bookingSteps = document.querySelectorAll('.booking-step');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const btnNext = document.querySelector('.btn-next');
  const btnBack = document.querySelector('.btn-back');

  if (bookingSteps.length > 0) {
    let currentStep = 0;
    const bookingData = {
      type: 'in-clinic', // default
      date: '',
      time: '',
      name: '',
      phone: '',
      email: '',
      gender: '',
      notes: '',
      payment: 'upi', // default
      fee: 1 // default
    };

    // Update Navigation UI
    const updateBookingUI = () => {
      // Toggle Step visibility
      bookingSteps.forEach((step, idx) => {
        if (idx === currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });

      // Toggle Indicators
      stepIndicators.forEach((indicator, idx) => {
        indicator.classList.remove('active', 'completed');
        if (idx < currentStep) {
          indicator.classList.add('completed');
          indicator.innerHTML = '<i class="ri-check-line"></i>';
        } else if (idx === currentStep) {
          indicator.classList.add('active');
          indicator.textContent = idx + 1;
        } else {
          indicator.textContent = idx + 1;
        }
      });

      // Handle buttons visibility
      if (currentStep === 0) {
        btnBack.style.visibility = 'hidden';
      } else {
        btnBack.style.visibility = 'visible';
      }

      if (currentStep === bookingSteps.length - 1) {
        // Last step (Confirmation)
        btnNext.style.display = 'none';
        btnBack.style.display = 'none';
      } else {
        btnNext.style.display = 'block';
        btnBack.style.display = 'block';
        if (currentStep === bookingSteps.length - 2) {
          btnNext.textContent = 'Pay & Confirm';
        } else {
          btnNext.textContent = 'Continue';
        }
      }
    };

    // Step 1 Selection: Appointment Type
    const aptTypeCards = document.querySelectorAll('.apt-type-card');
    aptTypeCards.forEach(card => {
      card.addEventListener('click', () => {
        aptTypeCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingData.type = card.dataset.type;

        // Fee adjustment
        if (bookingData.type === 'tele-consultation') {
          bookingData.fee = 200;
          document.getElementById('fee-item-name').textContent = 'Tele-Consultation Fee';
          document.getElementById('fee-item-amount').textContent = '₹200';
          document.getElementById('fee-total-amount').textContent = '₹200';
        } else {
          bookingData.fee = 1;
          document.getElementById('fee-item-name').textContent = 'In-Clinic Consultation Fee';
          document.getElementById('fee-item-amount').textContent = '₹1';
          document.getElementById('fee-total-amount').textContent = '₹1';
        }

        // Re-fetch slots if date is selected
        if (bookingData.date) {
          generateSlots();
        }
      });
    });

    // Step 2 Selection: Calendar Generation & Date Picking
    const calendarMonthLabel = document.querySelector('.calendar-month');
    const calendarGrid = document.querySelector('.calendar-grid');
    let currentDateObj = new Date();
    let displayMonth = currentDateObj.getMonth();
    let displayYear = currentDateObj.getFullYear();

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const generateCalendar = (month, year) => {
      calendarMonthLabel.textContent = `${months[month]} ${year}`;

      // Clear previous dates (except headers)
      const dateCells = calendarGrid.querySelectorAll('.cal-day, .cal-day-label');
      dateCells.forEach(cell => cell.remove());

      // Add day labels
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayLabels.forEach(day => {
        const lbl = document.createElement('div');
        lbl.className = 'cal-day-label';
        lbl.textContent = day;
        calendarGrid.appendChild(lbl);
      });

      // First day of month
      const firstDay = new Date(year, month, 1).getDay();
      // Number of days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day disabled';
        calendarGrid.appendChild(emptyCell);
      }

      // Add days
      const today = new Date();
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = day;

        const cellDate = new Date(year, month, day);

        // Disable past dates and weekends (Sat/Sun)
        if (cellDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
          cell.classList.add('disabled');
        } else if (cellDate.getDay() === 0 || cellDate.getDay() === 6) {
          cell.classList.add('disabled');
          cell.classList.add('weekend-day');
        } else {
          // Mark today
          if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
          }

          // Restore selection
          const formattedCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          if (bookingData.date === formattedCellDate) {
            cell.classList.add('selected');
          }

          // Click handler
          cell.addEventListener('click', () => {
            calendarGrid.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            bookingData.date = formattedCellDate;

            generateSlots();
          });
        }
        calendarGrid.appendChild(cell);
      }
    };

    // Calendar navigators
    document.querySelector('.cal-btn-next')?.addEventListener('click', () => {
      displayMonth++;
      if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
      }
      generateCalendar(displayMonth, displayYear);
    });

    document.querySelector('.cal-btn-prev')?.addEventListener('click', () => {
      displayMonth--;
      if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
      }
      // Don't go to past months
      const minMonth = new Date().getMonth();
      const minYear = new Date().getFullYear();
      if (displayYear < minYear || (displayYear === minYear && displayMonth < minMonth)) {
        displayMonth = minMonth;
        displayYear = minYear;
      } else {
        generateCalendar(displayMonth, displayYear);
      }
    });

    generateCalendar(displayMonth, displayYear);

    // Helper to format "13:30:00" -> "01:30 PM"
    const formatTime12h = (timeStr) => {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    };

    // Step 3 Selection: Time Slots (from Backend API)
    const slotsGrid = document.querySelector('.slots-container');

    const generateSlots = async () => {
      if (!slotsGrid) return;
      slotsGrid.innerHTML = '';

      if (!bookingData.date) {
        slotsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; font-size: 0.9rem;">Please select a date to view available time slots.</p>';
        return;
      }

      slotsGrid.innerHTML = `
        <div class="slots-loading">
          <div class="slots-spinner"></div>
          <span>Fetching available slots...</span>
        </div>
      `;

      const practitioner = 'HLC-PRAC-2026-00001';
      const appointmentType = bookingData.type === 'tele-consultation' ? 'consultation_vc' : 'consultation';
      const dateStr = bookingData.date;
      const duration = 15;

      const url = `https://b2b.medcortico.com/api/v1/appointments/slots/range?practitioner=${encodeURIComponent(practitioner)}&start_date=${dateStr}&end_date=${dateStr}&appointment_type=${encodeURIComponent(appointmentType)}&duration=${duration}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        slotsGrid.innerHTML = '';

        const dayData = data.slots_by_date && data.slots_by_date[dateStr];
        const availableSlots = (dayData && dayData.available_slots) || [];
        const bookedSlots = (dayData && dayData.booked_slots) || [];

        if (availableSlots.length === 0 && bookedSlots.length === 0) {
          slotsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1; font-size: 0.9rem;">No slots available for the selected date.</p>';
          return;
        }

        const availableList = availableSlots.map(s => ({ ...s, isBooked: false }));
        const bookedList = bookedSlots.map(s => ({ ...s, isBooked: true }));
        const allSlots = [...availableList, ...bookedList].sort((a, b) => a.start_time.localeCompare(b.start_time));

        const now = new Date();

        allSlots.forEach(slot => {
          const btn = document.createElement('div');
          const formattedTime = formatTime12h(slot.start_time);
          btn.className = 'slot-btn';
          btn.textContent = formattedTime;

          // Parse slot time. Handle ISO string vs HH:mm:ss string
          let slotDateTime;
          if (slot.start_time && slot.start_time.includes('T')) {
            slotDateTime = new Date(slot.start_time);
          } else if (slot.start_time && dateStr) {
            slotDateTime = new Date(`${dateStr}T${slot.start_time}`);
          } else {
            slotDateTime = new Date(slot.start_time);
          }

          const isPast = !isNaN(slotDateTime.getTime()) && slotDateTime < now;

          if (slot.isBooked || isPast) {
            btn.classList.add('disabled');
            btn.title = slot.isBooked ? 'Slot Already Booked' : 'Slot Time Passed';
          } else {
            if (bookingData.time === formattedTime) {
              btn.classList.add('selected');
            }

            btn.addEventListener('click', () => {
              slotsGrid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              bookingData.time = formattedTime;
            });
          }

          slotsGrid.appendChild(btn);
          btn.addEventListener('click', () => {
            if (!slot.isBooked && !isPast) {
              bookingData.rawTime = slot.start_time;
            }
          });
        });
      } catch (err) {
        console.error('Error fetching appointment slots:', err);
        slotsGrid.innerHTML = '<p style="color: var(--error-red, #ef4444); grid-column: 1 / -1; font-size: 0.9rem;">Unable to load time slots. Please ensure the backend server is running.</p>';
      }
    };

    // Trigger initial slots populate
    generateSlots();

    // Step 5 Selection: Payment Method
    const payMethodCards = document.querySelectorAll('.pay-method-card');
    payMethodCards.forEach(card => {
      card.addEventListener('click', () => {
        payMethodCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingData.payment = card.dataset.method;
      });
    });

    // Validate Steps before moving forward
    const validateStep = () => {
      if (currentStep === 0) {
        if (!bookingData.type) {
          alert('Please select an appointment type.');
          return false;
        }
      } else if (currentStep === 1) {
        if (!bookingData.date) {
          alert('Please select a date.');
          return false;
        }
      } else if (currentStep === 2) {
        if (!bookingData.time) {
          alert('Please select a time slot.');
          return false;
        }
      } else if (currentStep === 3) {
        const nameInput = document.getElementById('pt-name');
        const phoneInput = document.getElementById('pt-phone');
        const emailInput = document.getElementById('pt-email');
        const genderInput = document.getElementById('pt-gender');
        const notesInput = document.getElementById('pt-notes');

        if (!nameInput.value.trim()) {
          alert('Please enter your name.');
          nameInput.focus();
          return false;
        }
        if (!phoneInput.value.trim() || phoneInput.value.length < 10) {
          alert('Please enter a valid 10-digit phone number.');
          phoneInput.focus();
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          alert('Please enter a valid email address.');
          emailInput.focus();
          return false;
        }
        if (!genderInput.value) {
          alert('Please select your gender.');
          genderInput.focus();
          return false;
        }

        bookingData.name = nameInput.value.trim();
        bookingData.phone = phoneInput.value.trim();
        bookingData.email = emailInput.value.trim();
        bookingData.gender = genderInput.value;
        bookingData.notes = notesInput.value.trim();
      }
      return true;
    };

    // Navigation triggers
    btnNext.addEventListener('click', async () => {
      if (!validateStep()) return;

      // Handle step before Confirmation (Pay & Confirm)
      if (currentStep === bookingSteps.length - 2) {
        await submitBookingApi();
        return;
      }

      currentStep++;
      updateBookingUI();
    });

    btnBack.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateBookingUI();
      }
    });

    // API submission and payment redirect
    const submitBookingApi = async () => {
      const originalText = btnNext.textContent;
      btnNext.disabled = true;
      btnNext.textContent = 'Processing...';

      let formattedPhone = bookingData.phone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
      }

      const payload = {
        customer: {
          name: bookingData.name,
          phone: formattedPhone,
          email: bookingData.email,
          gender: bookingData.gender
        },
        practitioner_id: 'HLC-PRAC-2026-00001',
        appointment_date: bookingData.date,
        appointment_time: bookingData.rawTime || bookingData.time,
        appointment_type: bookingData.type === 'tele-consultation' ? 'consultation_vc' : 'consultation',
        complaint: bookingData.notes || 'General consultation'
      };

      try {
        const response = await fetch('https://b2b.medcortico.com/api/v1/appointments/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || 'Failed to book appointment.');
        }

        const data = await response.json();
        if (data && data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          alert('Booking processed, but no payment URL returned.');
        }
      } catch (err) {
        console.error('Booking error:', err);
        alert('Failed to process booking: ' + err.message);
      } finally {
        btnNext.disabled = false;
        btnNext.textContent = originalText;
      }
    };

    // Initialize UI
    updateBookingUI();
  }

  // =========================================================================
  // 5. Tooth pain education quiz (resources.html)
  // =========================================================================
  const quizForm = document.getElementById('tooth-quiz');
  if (quizForm) {
    const quizSteps = [...quizForm.querySelectorAll('.quiz-step')];
    const next = document.getElementById('quiz-next');
    const back = document.getElementById('quiz-back');
    const error = document.getElementById('quiz-error');
    const result = document.getElementById('quiz-result');
    const progressBar = document.getElementById('quiz-progress-bar');
    const stepLabel = document.getElementById('quiz-step-label');
    const percentLabel = document.getElementById('quiz-percent');
    let quizStep = 0;

    const updateQuiz = () => {
      quizSteps.forEach((step, index) => step.classList.toggle('active', index === quizStep));
      const percent = Math.round(((quizStep + 1) / quizSteps.length) * 100);
      progressBar.style.width = `${percent}%`;
      stepLabel.textContent = `Question ${quizStep + 1} of ${quizSteps.length}`;
      percentLabel.textContent = `${percent}%`;
      back.disabled = quizStep === 0;
      next.innerHTML = quizStep === quizSteps.length - 1
        ? 'See my result <i class="ri-pulse-line"></i>'
        : 'Next <i class="ri-arrow-right-line"></i>';
      error.textContent = '';
    };

    const showResult = () => {
      const answers = [...quizForm.querySelectorAll('input:checked')];
      const rawScore = answers.reduce((sum, input) => sum + Number(input.value), 0);
      const hasRedFlag = answers.some(input => input.dataset.redFlag === 'true');
      let score = Math.min(10, Math.max(1, Math.round((rawScore / 25) * 10)));
      if (hasRedFlag) score = 10;

      let title = 'Plan a routine dental assessment';
      let status = 'Lower urgency · Book within 1–2 weeks';
      let copy = 'Your answers do not suggest an immediate warning sign, but persistent or recurring symptoms still deserve an examination. Early care may keep treatment simpler.';
      let color = '#0d9488';

      if (score >= 9 || hasRedFlag) {
        title = 'Seek urgent professional care';
        status = 'Urgent · Contact a dentist now';
        copy = hasRedFlag
          ? 'Your answers include a warning sign. Contact the clinic now. Trouble breathing or swallowing, rapidly spreading swelling, or swelling near the eye or neck requires immediate emergency medical care.'
          : 'Your symptom pattern needs prompt assessment. Contact the clinic today so the source of pain or infection can be examined.';
        color = '#dc2626';
      } else if (score >= 6) {
        title = 'Arrange a prompt dental assessment';
        status = 'High priority · Ideally within 24–48 hours';
        copy = 'Your answers may fit significant inflammation, infection, or damage. An exam and X-ray can show whether the tooth is restorable and whether root canal treatment or another option is appropriate.';
        color = '#ea580c';
      } else if (score >= 3) {
        title = 'Book a dental assessment soon';
        status = 'Moderate priority · Ideally within a few days';
        copy = 'The symptoms should be checked before they worsen. If the tooth is restorable, earlier care may preserve more of it and keep more treatment options open.';
        color = '#ca8a04';
      }

      quizForm.style.display = 'none';
      document.querySelector('.quiz-progress-wrap').style.display = 'none';
      result.classList.add('active');
      document.getElementById('urgency-score').textContent = score;
      const ring = document.getElementById('urgency-ring');
      ring.style.setProperty('--score-angle', `${score * 36}deg`);
      ring.style.setProperty('--urgency-color', color);
      document.getElementById('result-title').textContent = title;
      document.getElementById('result-status').textContent = status;
      document.getElementById('result-status').style.color = color;
      document.getElementById('result-copy').textContent = copy;
      document.getElementById('quiz-whatsapp').href = `https://wa.me/917022839062?text=${encodeURIComponent(`Hi Dr. Ashwini, I completed the tooth pain checker. My urgency score was ${score}/10 (${status}). I would like help arranging an assessment.`)}`;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    next.addEventListener('click', () => {
      if (!quizSteps[quizStep].querySelector('input:checked')) {
        error.textContent = 'Please choose the answer that fits best.';
        return;
      }
      if (quizStep < quizSteps.length - 1) {
        quizStep++;
        updateQuiz();
      } else {
        showResult();
      }
    });
    back.addEventListener('click', () => { if (quizStep > 0) { quizStep--; updateQuiz(); } });
    document.getElementById('quiz-restart').addEventListener('click', () => {
      quizForm.reset();
      quizStep = 0;
      quizForm.style.display = '';
      document.querySelector('.quiz-progress-wrap').style.display = '';
      result.classList.remove('active');
      updateQuiz();
    });
    updateQuiz();
  }

  // =========================================================================
  // 6. Entry Animations via IntersectionObserver
  // =========================================================================
  const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target); // Trigger once
        }
      });
    }, {
      threshold: 0.15
    });

    // Tag elements to animate
    const itemsToAnimate = document.querySelectorAll('.service-card, .vision-card, .about-brief-img-container, .doc-vision-text, .about-feature-card');
    itemsToAnimate.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      observer.observe(item);
    });
  };

  animateOnScroll();

});
