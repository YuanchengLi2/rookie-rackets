import type { DemoState } from './types';

const seededState: DemoState = {
  version: 2,
  demoDate: '2026-09-02',
  session: null,
  familyProfiles: [
    { id: 'family-demo', firstName: 'Jordan', lastName: 'Lee', email: 'jordan@example.test', phone: '919-555-0110', emailUpdates: true },
  ],
  staffProfiles: [
    { id: 'staff-demo', name: 'Yuancheng', role: 'Operations lead', email: 'team@example.test', initials: 'YC' },
    { id: 'staff-adithya', name: 'Adithya', role: 'Program lead', email: 'adithya@example.test', initials: 'AD' },
    { id: 'staff-nathan', name: 'Nathan', role: 'Program lead', email: 'nathan@example.test', initials: 'NA' },
    { id: 'staff-nikhil', name: 'Nikhil', role: 'Community partnerships', email: 'nikhil@example.test', initials: 'NI' },
  ],
  programs: [
    {
      id: 'program-boys-club', slug: 'boys-club-fall', name: 'Boys Club Fall', organizationId: 'organization-boys-club', type: 'recurring-partner-program',
      description: 'An intro series for first-time players with a relaxed, coach-led format.', venue: 'Boys Club of Raleigh', skillLevel: 'beginner', eligibility: 'Grades 3–8', capacity: 24, leadCoachId: 'coach-adithya', status: 'active', visibility: 'public', price: 0, registrationDeadline: '2026-09-18', whatToBring: ['Athletic shoes', 'Water bottle'], equipmentProvided: true, image: '/images/hero-workshop.webp', contact: 'Adithya · teamrookierackets@gmail.com',
    },
    {
      id: 'program-tmsa-fall', slug: 'tmsa-fall', name: 'TMSA Fall Workshop', organizationId: 'organization-tmsa', type: 'multiweek-school-program',
      description: 'Five school workshops that move from racket basics to cooperative games.', venue: 'TMSA Elementary', skillLevel: 'mixed', eligibility: 'Elementary students', capacity: 20, leadCoachId: 'coach-nathan', status: 'registration-open', visibility: 'public', price: 0, registrationDeadline: '2026-09-25', whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/gallery-certificates.webp', contact: 'Nathan · teamrookierackets@gmail.com',
    },
    {
      id: 'program-carpenter', slug: 'carpenter-elementary', name: 'Carpenter Elementary Workshop', organizationId: 'organization-carpenter', type: 'one-day-workshop',
      description: 'A beginner workshop planned with Carpenter Elementary.', venue: 'Carpenter Elementary', skillLevel: 'beginner', eligibility: 'Elementary students', capacity: 24, leadCoachId: 'coach-adithya', status: 'planning', visibility: 'public', price: 0, registrationDeadline: '2026-10-01', whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/story.webp', contact: 'Adithya · teamrookierackets@gmail.com',
    },
    {
      id: 'program-rjourney', slug: 'rjourney-camp', name: 'RJourney Camp', organizationId: 'organization-rjourney', type: 'camp',
      description: 'A completed summer camp with a focus on confidence and movement.', venue: 'RJourney', skillLevel: 'mixed', eligibility: 'All ages', capacity: 30, leadCoachId: 'coach-nikhil', status: 'completed', visibility: 'public', price: 0, registrationDeadline: '2026-08-01', whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/gallery-action-1.webp', contact: 'Nikhil · teamrookierackets@gmail.com',
    },
    {
      id: 'program-vibha', slug: 'vibha-camp', name: 'VIBHA Camp', organizationId: 'organization-vibha', type: 'camp',
      description: 'A completed community camp and equipment-sharing initiative.', venue: 'VIBHA', skillLevel: 'mixed', eligibility: 'All ages', capacity: 30, leadCoachId: 'coach-aarav', status: 'completed', visibility: 'public', price: 0, registrationDeadline: '2026-07-01', whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/outreach.webp', contact: 'Aarav · teamrookierackets@gmail.com',
    },
    {
      id: 'program-peak-sports', slug: 'peak-sports-camp', name: 'Peak Sports Camp', organizationId: 'organization-peak', type: 'camp',
      description: 'A fictional historical program record used to demonstrate registrations and finance views.', venue: 'Peak Sports', skillLevel: 'mixed', eligibility: 'All ages', capacity: 24, leadCoachId: 'coach-vihaan', status: 'completed', visibility: 'private', price: 0, registrationDeadline: '2026-07-01', whatToBring: ['Athletic shoes'], equipmentProvided: true, image: '/images/coaching.webp', contact: 'Vihaan · teamrookierackets@gmail.com',
    },
  ],
  sessions: [
    { id: 'session-boys-aug-28', programId: 'program-boys-club', date: '2026-08-28', startTime: '4:00 PM', endTime: '5:00 PM', arrivalTime: '3:40 PM', location: 'Boys Club of Raleigh', coachIds: ['coach-adithya', 'coach-vihaan', 'coach-aarav', 'coach-ishan'], leadCoachId: 'coach-adithya', curriculumFileId: 'file-boys-curriculum', curriculum: { objective: 'Introduce safe racket handling and cooperative rallies', activities: [{ id: 'curriculum-boys-aug-warmup', kind: 'warm-up', title: 'Movement mirror', minutes: 10, instructions: 'Pair players and mirror simple court movements.' }, { id: 'curriculum-boys-aug-skill', kind: 'skill', title: 'Grip and tap-ups', minutes: 20, instructions: 'Practice relaxed grip and controlled shuttle taps.' }, { id: 'curriculum-boys-aug-game', kind: 'game', title: 'Partner rally challenge', minutes: 20, instructions: 'Count consecutive cooperative contacts.' }, { id: 'curriculum-boys-aug-cooldown', kind: 'cool-down', title: 'Team recap', minutes: 10, instructions: 'Stretch and share one new skill.' }], coachNotes: 'Use loaner rackets and keep group sizes small.', updatedAt: '2026-08-25' }, status: 'completed', notes: 'First session completed.' },
    { id: 'session-boys-sep-04', programId: 'program-boys-club', date: '2026-09-04', startTime: '4:00 PM', endTime: '5:00 PM', arrivalTime: '3:40 PM', location: 'Boys Club of Raleigh', coachIds: ['coach-adithya', 'coach-aarav', 'coach-ishan'], leadCoachId: 'coach-adithya', curriculumFileId: 'file-boys-curriculum', curriculum: { objective: 'Build control through serves and short rallies', activities: [{ id: 'curriculum-boys-sep04-warmup', kind: 'warm-up', title: 'Shuttle balance relay', minutes: 10, instructions: 'Balance a shuttle on the racket while moving between cones.' }, { id: 'curriculum-boys-sep04-skill', kind: 'skill', title: 'Underhand serve stations', minutes: 20, instructions: 'Rotate through contact, direction, and target stations.' }, { id: 'curriculum-boys-sep04-game', kind: 'game', title: 'Serve and rally', minutes: 25, instructions: 'Start each cooperative rally with a legal underhand serve.' }, { id: 'curriculum-boys-sep04-cooldown', kind: 'cool-down', title: 'Reset and reflect', minutes: 5, instructions: 'Collect equipment and name one serving cue.' }], coachNotes: 'Set up large targets before players arrive.', updatedAt: '2026-08-28' }, status: 'scheduled', notes: '' },
    { id: 'session-boys-sep-11', programId: 'program-boys-club', date: '2026-09-11', startTime: '4:00 PM', endTime: '5:00 PM', arrivalTime: '3:40 PM', location: 'Boys Club of Raleigh', coachIds: ['coach-vihaan', 'coach-nathan', 'coach-tanay', 'coach-yuancheng'], leadCoachId: 'coach-vihaan', curriculumFileId: 'file-boys-curriculum', curriculum: { objective: 'Move to the shuttle and recover to ready position', activities: [{ id: 'curriculum-boys-sep11-warmup', kind: 'warm-up', title: 'Court line movement', minutes: 10, instructions: 'Move along lines using side steps and split steps.' }, { id: 'curriculum-boys-sep11-skill', kind: 'skill', title: 'Hit and recover', minutes: 25, instructions: 'Feed shuttles to four zones and return to center.' }, { id: 'curriculum-boys-sep11-game', kind: 'game', title: 'Four-corner rally', minutes: 20, instructions: 'Earn a point for recovering after each contact.' }, { id: 'curriculum-boys-sep11-cooldown', kind: 'cool-down', title: 'Breathing reset', minutes: 5, instructions: 'Cool down and review ready position.' }], coachNotes: 'Confirm the final coach roster before setting station groups.', updatedAt: '2026-08-29' }, status: 'scheduled', notes: 'Confirm the final coach roster.' },
    { id: 'session-boys-sep-18', programId: 'program-boys-club', date: '2026-09-18', startTime: '4:00 PM', endTime: '5:00 PM', arrivalTime: '3:40 PM', location: 'Boys Club of Raleigh', coachIds: ['coach-adithya', 'coach-vihaan'], leadCoachId: 'coach-adithya', curriculumFileId: 'file-boys-curriculum', curriculum: { objective: 'Celebrate progress through team games', activities: [{ id: 'curriculum-boys-sep18-warmup', kind: 'warm-up', title: 'Favorite warm-up vote', minutes: 10, instructions: 'Repeat the group favorite from earlier sessions.' }, { id: 'curriculum-boys-sep18-skill', kind: 'skill', title: 'Skills circuit', minutes: 20, instructions: 'Rotate through serve, rally, and movement stations.' }, { id: 'curriculum-boys-sep18-game', kind: 'game', title: 'Team festival', minutes: 25, instructions: 'Play short cooperative team challenges.' }, { id: 'curriculum-boys-sep18-cooldown', kind: 'cool-down', title: 'Celebration circle', minutes: 5, instructions: 'Recognize effort and hand out certificates.' }], coachNotes: 'Bring certificates and take only consent-approved photos.', updatedAt: '2026-08-30' }, status: 'scheduled', notes: '' },
    { id: 'session-tmsa-oct-02', programId: 'program-tmsa-fall', date: '2026-10-02', startTime: '3:30 PM', endTime: '5:00 PM', arrivalTime: '3:10 PM', location: 'TMSA Elementary', coachIds: ['coach-nathan', 'coach-tanay', 'coach-yuancheng', 'coach-aarav'], leadCoachId: 'coach-nathan', curriculumFileId: 'file-tmsa-curriculum', curriculum: { objective: 'Introduce badminton through movement and contact games', activities: [{ id: 'curriculum-tmsa-oct02-warmup', kind: 'warm-up', title: 'Color cone movement', minutes: 15, instructions: 'Move to called colors using court-ready footwork.' }, { id: 'curriculum-tmsa-oct02-skill', kind: 'skill', title: 'Racket and shuttle basics', minutes: 30, instructions: 'Practice grip, balance, and controlled taps.' }, { id: 'curriculum-tmsa-oct02-game', kind: 'game', title: 'Cooperative rally ladder', minutes: 35, instructions: 'Progress from self-rally to partner rally targets.' }, { id: 'curriculum-tmsa-oct02-cooldown', kind: 'cool-down', title: 'Exit reflection', minutes: 10, instructions: 'Reset equipment and share one success.' }], coachNotes: 'Use four clearly labeled station groups.', updatedAt: '2026-08-28' }, status: 'scheduled', notes: '' },
    { id: 'session-tmsa-oct-09', programId: 'program-tmsa-fall', date: '2026-10-09', startTime: '3:30 PM', endTime: '5:00 PM', arrivalTime: '3:10 PM', location: 'TMSA Elementary', coachIds: ['coach-nathan', 'coach-tanay'], leadCoachId: 'coach-nathan', curriculumFileId: 'file-tmsa-curriculum', curriculum: { objective: 'Develop serve direction and ready position', activities: [{ id: 'curriculum-tmsa-oct09-warmup', kind: 'warm-up', title: 'Ready-position tag', minutes: 15, instructions: 'Use split-step freezes during a low-intensity tag game.' }, { id: 'curriculum-tmsa-oct09-skill', kind: 'skill', title: 'Serve to zones', minutes: 35, instructions: 'Serve toward large near and far targets.' }, { id: 'curriculum-tmsa-oct09-game', kind: 'game', title: 'Serve, return, recover', minutes: 30, instructions: 'Play cooperative three-contact sequences.' }, { id: 'curriculum-tmsa-oct09-cooldown', kind: 'cool-down', title: 'Coach recap', minutes: 10, instructions: 'Review two serve cues and reset gear.' }], coachNotes: 'Two coaches means use two large groups rather than four stations.', updatedAt: '2026-08-28' }, status: 'scheduled', notes: '' },
    { id: 'session-carpenter-oct-16', programId: 'program-carpenter', date: '2026-10-16', startTime: '4:00 PM', endTime: '5:30 PM', arrivalTime: '3:40 PM', location: 'Carpenter Elementary', coachIds: ['coach-adithya'], leadCoachId: 'coach-adithya', curriculumFileId: 'file-carpenter-curriculum', curriculum: { objective: 'Deliver an accessible first badminton experience', activities: [{ id: 'curriculum-carpenter-warmup', kind: 'warm-up', title: 'Movement sampler', minutes: 15, instructions: 'Explore side steps, reaches, and balance.' }, { id: 'curriculum-carpenter-skill', kind: 'skill', title: 'Contact progression', minutes: 30, instructions: 'Move from balloon taps to shuttle taps.' }, { id: 'curriculum-carpenter-game', kind: 'game', title: 'Rally festival', minutes: 35, instructions: 'Run cooperative pair and team challenges.' }, { id: 'curriculum-carpenter-cooldown', kind: 'cool-down', title: 'Closing circle', minutes: 10, instructions: 'Review safety and celebrate first rallies.' }], coachNotes: 'Draft plan; adjust group sizes after partner confirmation.', updatedAt: '2026-08-12' }, status: 'scheduled', notes: '' },
  ],
  coaches: [
    { id: 'coach-adithya', name: 'Adithya', email: 'adithya@example.test', role: 'program-lead', active: true, experience: 'Nationally trained player and program lead.', availability: 'available', volunteerHours: 18.5, assignmentIds: [] },
    { id: 'coach-vihaan', name: 'Vihaan', email: 'vihaan@example.test', role: 'coach', active: true, experience: 'Competitive player and returning workshop coach.', availability: 'available', volunteerHours: 12, assignmentIds: [] },
    { id: 'coach-aarav', name: 'Aarav', email: 'aarav@example.test', role: 'coach', active: true, experience: 'Youth coaching and tournament experience.', availability: 'tentative', volunteerHours: 10.5, assignmentIds: [] },
    { id: 'coach-ishan', name: 'Ishan', email: 'ishan@example.test', role: 'assistant', active: true, experience: 'Student coach and equipment lead.', availability: 'available', volunteerHours: 8, assignmentIds: [] },
    { id: 'coach-nathan', name: 'Nathan', email: 'nathan@example.test', role: 'program-lead', active: true, experience: 'School-program lead.', availability: 'available', volunteerHours: 15, assignmentIds: [] },
    { id: 'coach-tanay', name: 'Tanay', email: 'tanay@example.test', role: 'coach', active: true, experience: 'Workshop coach.', availability: 'informational', volunteerHours: 7.5, assignmentIds: [] },
    { id: 'coach-yuancheng', name: 'Yuancheng', email: 'yuancheng@example.test', role: 'volunteer', active: true, experience: 'Operations and coaching volunteer.', availability: 'tentative', volunteerHours: 9, assignmentIds: [] },
    { id: 'coach-nikhil', name: 'Nikhil', email: 'nikhil@example.test', role: 'program-lead', active: true, experience: 'Community partnerships and program lead.', availability: 'available', volunteerHours: 20, assignmentIds: [] },
  ],
  assignments: [],
  registrations: [
    { id: 'registration-family-boys', familyId: 'family-demo', programId: 'program-boys-club', childFirstName: 'Sam', childLastName: 'Lee', dateOfBirth: '2015-05-12', grade: '5th Grade', skillLevel: 'beginner', guardianFirstName: 'Jordan', guardianLastName: 'Lee', guardianEmail: 'jordan@example.test', guardianPhone: '919-555-0110', emergencyName: 'Taylor Lee', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0111', supportNotes: '', needsRacket: true, parentOnsite: false, selectedSessionIds: ['session-boys-aug-28', 'session-boys-sep-04', 'session-boys-sep-11', 'session-boys-sep-18'], registrationStatus: 'confirmed', paymentStatus: 'waived', createdAt: '2026-08-18' },
    { id: 'registration-family-tmsa', familyId: 'family-demo', programId: 'program-tmsa-fall', childFirstName: 'Sam', childLastName: 'Lee', dateOfBirth: '2015-05-12', grade: '5th Grade', skillLevel: 'beginner', guardianFirstName: 'Jordan', guardianLastName: 'Lee', guardianEmail: 'jordan@example.test', guardianPhone: '919-555-0110', emergencyName: 'Taylor Lee', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0111', supportNotes: '', needsRacket: false, parentOnsite: true, selectedSessionIds: ['session-tmsa-oct-02', 'session-tmsa-oct-09'], registrationStatus: 'offer-sent', paymentStatus: 'waived', createdAt: '2026-08-22' },
    { id: 'registration-peak-dhruva', familyId: 'family-demo', programId: 'program-peak-sports', childFirstName: 'Dhruva', childLastName: 'Demo', dateOfBirth: '2014-03-10', grade: '6th Grade', skillLevel: 'intermediate', guardianFirstName: 'Kamal', guardianLastName: 'Demo', guardianEmail: 'kamal@example.test', guardianPhone: '919-555-0112', emergencyName: 'Prathima Demo', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0113', supportNotes: '', needsRacket: false, parentOnsite: false, selectedSessionIds: [], registrationStatus: 'completed', paymentStatus: 'paid', createdAt: '2026-07-02' },
  ],
  consents: [
    { id: 'consent-boys-waiver', registrationId: 'registration-family-boys', type: 'participation-waiver', version: '2026.1', accepted: true, acceptedAt: '2026-08-18' },
    { id: 'consent-boys-photo', registrationId: 'registration-family-boys', type: 'photo-video', version: '2026.1', accepted: false, acceptedAt: null },
    { id: 'consent-boys-ack', registrationId: 'registration-family-boys', type: 'program-acknowledgment', version: '2026.1', accepted: true, acceptedAt: '2026-08-18' },
    { id: 'consent-boys-pickup', registrationId: 'registration-family-boys', type: 'pickup-policy', version: '2026.1', accepted: true, acceptedAt: '2026-08-18' },
    { id: 'consent-tmsa-waiver', registrationId: 'registration-family-tmsa', type: 'participation-waiver', version: '2026.1', accepted: true, acceptedAt: '2026-08-22' },
    { id: 'consent-tmsa-photo', registrationId: 'registration-family-tmsa', type: 'photo-video', version: '2026.1', accepted: false, acceptedAt: null },
    { id: 'consent-tmsa-ack', registrationId: 'registration-family-tmsa', type: 'program-acknowledgment', version: '2026.1', accepted: true, acceptedAt: '2026-08-22' },
    { id: 'consent-tmsa-pickup', registrationId: 'registration-family-tmsa', type: 'pickup-policy', version: '2026.1', accepted: true, acceptedAt: '2026-08-22' },
  ],
  payments: [
    { id: 'payment-boys', registrationId: 'registration-family-boys', programId: 'program-boys-club', amount: 0, status: 'waived', paymentDate: '2026-08-18', receiptNumber: 'RR-DEMO-001', note: 'Free community program' },
    { id: 'payment-tmsa', registrationId: 'registration-family-tmsa', programId: 'program-tmsa-fall', amount: 0, status: 'waived', paymentDate: '2026-08-22', receiptNumber: 'RR-DEMO-002', note: 'Free school workshop' },
    { id: 'payment-peak', registrationId: 'registration-peak-dhruva', programId: 'program-peak-sports', amount: 0, status: 'paid', paymentDate: '2026-07-02', receiptNumber: 'RR-DEMO-003', note: 'Historical demo payment record' },
  ],
  attendance: [
    { id: 'attendance-family-boys-aug', registrationId: 'registration-family-boys', sessionId: 'session-boys-aug-28', status: 'present', note: '', updatedAt: '2026-08-28' },
    { id: 'attendance-family-boys-sep04', registrationId: 'registration-family-boys', sessionId: 'session-boys-sep-04', status: 'not-marked', note: '', updatedAt: null },
    { id: 'attendance-family-boys-sep11', registrationId: 'registration-family-boys', sessionId: 'session-boys-sep-11', status: 'not-marked', note: '', updatedAt: null },
    { id: 'attendance-family-boys-sep18', registrationId: 'registration-family-boys', sessionId: 'session-boys-sep-18', status: 'not-marked', note: '', updatedAt: null },
  ],
  organizations: [
    { id: 'organization-boys-club', name: 'Boys Club Raleigh', type: 'community-center', website: 'boysclub.example.test', address: 'Raleigh, NC', leadStaffId: 'staff-adithya', supportStaff: ['staff-demo'], primaryContact: 'Program coordinator', primaryContactEmail: 'coordinator@example.test', status: 'active-partner', lastUpdate: 'Roster confirmed', nextStep: 'Confirm Sep 11 coaches', programIds: ['program-boys-club'], projectIds: [], driveFileIds: ['file-main-drive'] },
    { id: 'organization-tmsa', name: 'TMSA', type: 'school', website: 'tmsa.example.test', address: 'Cary, NC', leadStaffId: 'staff-nathan', supportStaff: ['staff-demo'], primaryContact: 'School activities office', primaryContactEmail: 'activities@example.test', status: 'active-partner', lastUpdate: 'Fall planning', nextStep: 'Confirm dates', programIds: ['program-tmsa-fall'], projectIds: [], driveFileIds: ['file-tmsa-curriculum'] },
    { id: 'organization-carpenter', name: 'Carpenter Elementary', type: 'school', website: 'carpenter.example.test', address: 'Cary, NC', leadStaffId: 'staff-adithya', supportStaff: [], primaryContact: 'Kim Collins', primaryContactEmail: 'kim@example.test', status: 'active-partner', lastUpdate: 'Workshop completed', nextStep: 'Plan next session', programIds: ['program-carpenter'], projectIds: [], driveFileIds: ['file-meeting-notes'] },
    { id: 'organization-white-oak', name: 'White Oak', type: 'school', website: 'whiteoak.example.test', address: 'Apex, NC', leadStaffId: 'staff-nathan', supportStaff: ['staff-demo'], primaryContact: 'School office', primaryContactEmail: 'office@example.test', status: 'follow-up-due', lastUpdate: 'Email sent', nextStep: 'Follow up Sep 5', programIds: [], projectIds: [], driveFileIds: ['file-meeting-notes'] },
    { id: 'organization-apex', name: 'Apex Community Center', type: 'community-center', website: 'apex.example.test', address: 'Apex, NC', leadStaffId: 'staff-demo', supportStaff: [], primaryContact: 'Community programs desk', primaryContactEmail: 'programs@example.test', status: 'contacted', lastUpdate: 'Waiting on response', nextStep: 'Check Sep 6', programIds: [], projectIds: [], driveFileIds: [] },
    { id: 'organization-rjourney', name: 'RJourney', type: 'nonprofit', website: 'rjourney.example.test', address: 'Raleigh, NC', leadStaffId: 'staff-nikhil', supportStaff: [], primaryContact: 'Camp coordinator', primaryContactEmail: 'camp@example.test', status: 'active-partner', lastUpdate: 'Camp completed', nextStep: 'Maintain relationship', programIds: ['program-rjourney'], projectIds: [], driveFileIds: [] },
    { id: 'organization-vibha', name: 'VIBHA', type: 'nonprofit', website: 'vibha.example.test', address: 'Cary, NC', leadStaffId: 'staff-demo', supportStaff: [], primaryContact: 'Community liaison', primaryContactEmail: 'liaison@example.test', status: 'active-partner', lastUpdate: 'Camp completed', nextStep: 'Share photo recap', programIds: ['program-vibha'], projectIds: [], driveFileIds: [] },
    { id: 'organization-peak', name: 'Peak Sports', type: 'sports-facility', website: 'peaksports.example.test', address: 'Cary, NC', leadStaffId: 'staff-demo', supportStaff: [], primaryContact: 'Peak Sports desk', primaryContactEmail: 'desk@example.test', status: 'dormant', lastUpdate: 'Historical camp', nextStep: 'Review next season', programIds: ['program-peak-sports'], projectIds: [], driveFileIds: [] },
  ],
  interactions: [
    { id: 'interaction-white-oak-email', organizationId: 'organization-white-oak', date: '2026-08-29', ownerId: 'staff-nathan', kind: 'email', outcome: 'Email sent', notes: 'Shared the fall workshop overview.', nextAction: 'Follow up Sep 5' },
    { id: 'interaction-white-oak-call', organizationId: 'organization-white-oak', date: '2026-08-20', ownerId: 'staff-nathan', kind: 'call', outcome: 'Requested dates', notes: 'School office asked for a few schedule options.', nextAction: 'Send schedule options' },
    { id: 'interaction-apex-email', organizationId: 'organization-apex', date: '2026-08-30', ownerId: 'staff-demo', kind: 'email', outcome: 'Waiting on response', notes: 'Sent a short partnership introduction.', nextAction: 'Check Sep 6' },
    { id: 'interaction-carpenter-visit', organizationId: 'organization-carpenter', date: '2026-08-15', ownerId: 'staff-adithya', kind: 'visit', outcome: 'Workshop completed', notes: 'Principal shared positive feedback.', nextAction: 'Plan next session' },
  ],
  projects: [
    { id: 'project-family-portal', name: 'Family Portal', ownerId: 'staff-demo', contributorIds: ['staff-nikhil'], status: 'in-progress', priority: 'high', startDate: '2026-08-01', targetDate: '2026-09-30', description: 'Prepare a simple family-facing registration and status experience.', organizationId: null, programId: null, driveFileIds: ['file-meeting-notes'] },
    { id: 'project-website-update', name: 'Website Update', ownerId: 'staff-nikhil', contributorIds: ['staff-demo'], status: 'in-progress', priority: 'medium', startDate: '2026-08-10', targetDate: '2026-09-20', description: 'Keep public programs and the team page current.', organizationId: null, programId: null, driveFileIds: ['file-main-drive'] },
    { id: 'project-new-banner', name: 'New Banner', ownerId: 'staff-adithya', contributorIds: [], status: 'in-progress', priority: 'medium', startDate: '2026-08-22', targetDate: '2026-09-12', description: 'Finalize the print file for fall outreach.', organizationId: null, programId: null, driveFileIds: [] },
    { id: 'project-tournament-2027', name: '2027 Tournament', ownerId: 'staff-nathan', contributorIds: ['staff-demo'], status: 'planning', priority: 'high', startDate: '2026-09-01', targetDate: '2027-03-01', description: 'Draft the venue and partnership list for a future tournament.', organizationId: null, programId: null, driveFileIds: [] },
  ],
  tasks: [
    { id: 'task-family-portal-proposal', title: 'Present proposal', ownerId: 'staff-demo', dueDate: '2026-09-05', status: 'in-progress', priority: 'high', projectId: 'project-family-portal', programId: null, organizationId: null, notes: 'Use the demo walkthrough.' },
    { id: 'task-family-portal-copy', title: 'Review registration copy', ownerId: 'staff-nikhil', dueDate: '2026-09-09', status: 'not-started', priority: 'medium', projectId: 'project-family-portal', programId: null, organizationId: null, notes: '' },
    { id: 'task-boys-schedule', title: 'Update Boys Club schedule', ownerId: 'staff-adithya', dueDate: '2026-09-04', status: 'in-progress', priority: 'high', projectId: null, programId: 'program-boys-club', organizationId: null, notes: 'Confirm the Sep 11 roster.' },
    { id: 'task-apex-followup', title: 'Contact Apex Community Center', ownerId: 'staff-demo', dueDate: '2026-09-06', status: 'awaiting-reply', priority: 'medium', projectId: null, programId: null, organizationId: 'organization-apex', notes: '' },
    { id: 'task-tmsa-curriculum', title: 'Finalize TMSA curriculum', ownerId: 'staff-nathan', dueDate: '2026-09-08', status: 'in-progress', priority: 'high', projectId: null, programId: 'program-tmsa-fall', organizationId: 'organization-tmsa', notes: '' },
    { id: 'task-white-oak-followup', title: 'Follow up with White Oak', ownerId: 'staff-nathan', dueDate: '2026-09-05', status: 'awaiting-reply', priority: 'high', projectId: null, programId: null, organizationId: 'organization-white-oak', notes: '' },
    { id: 'task-banner-print', title: 'Finalize print file', ownerId: 'staff-adithya', dueDate: '2026-09-10', status: 'in-progress', priority: 'medium', projectId: 'project-new-banner', programId: null, organizationId: null, notes: '' },
  ],
  financeEntries: [
    { id: 'finance-donation', kind: 'revenue', programId: null, projectId: null, date: '2026-08-05', description: 'Community donation', category: 'Direct donation', amount: 250, paidBy: 'Community supporter', receiptFileId: 'file-receipt-donation', reimbursementStatus: 'not-applicable' },
    { id: 'finance-sponsorship', kind: 'revenue', programId: 'program-boys-club', projectId: null, date: '2026-08-18', description: 'Fall program sponsorship', category: 'Sponsorship', amount: 500, paidBy: 'Local sponsor', receiptFileId: null, reimbursementStatus: 'not-applicable' },
    { id: 'finance-equipment', kind: 'expense', programId: 'program-boys-club', projectId: null, date: '2026-08-24', description: 'Shuttlecocks and grips', category: 'Equipment', amount: 86, paidBy: 'Adithya', receiptFileId: 'file-receipt-equipment', reimbursementStatus: 'requested' },
    { id: 'finance-printing', kind: 'expense', programId: 'program-tmsa-fall', projectId: 'project-new-banner', date: '2026-08-27', description: 'Fall workshop flyers', category: 'Printing', amount: 42, paidBy: 'Yuancheng', receiptFileId: null, reimbursementStatus: 'not-applicable' },
  ],
  files: [
    { id: 'file-main-drive', name: 'Main Rookie Rackets Drive', kind: 'drive-folder', description: 'Demo folder containing program folders and shared operations files.', updatedAt: '2026-08-30' },
    { id: 'file-boys-curriculum', name: 'Boys Club Fall curriculum', kind: 'document', description: 'Four-session beginner curriculum outline.', updatedAt: '2026-08-25' },
    { id: 'file-tmsa-curriculum', name: 'TMSA workshop curriculum', kind: 'document', description: 'School workshop lesson sequence.', updatedAt: '2026-08-28' },
    { id: 'file-carpenter-curriculum', name: 'Carpenter workshop outline', kind: 'document', description: 'Draft workshop run sheet.', updatedAt: '2026-08-12' },
    { id: 'file-meeting-notes', name: 'Partner meeting notes', kind: 'notes', description: 'Demo notes and action items from partner conversations.', updatedAt: '2026-08-29' },
    { id: 'file-receipt-donation', name: 'Donation receipt RR-2026-08', kind: 'receipt', description: 'Fictional donation receipt preview.', updatedAt: '2026-08-05' },
    { id: 'file-receipt-equipment', name: 'Equipment receipt RR-2026-08', kind: 'receipt', description: 'Fictional equipment receipt preview.', updatedAt: '2026-08-24' },
  ],
  activity: [
    { id: 'activity-1', date: '2026-09-02', message: 'White Oak follow-up is due Sep 5.', kind: 'organization' },
    { id: 'activity-2', date: '2026-09-01', message: 'TMSA Fall is ready for curriculum review.', kind: 'program' },
    { id: 'activity-3', date: '2026-08-29', message: 'A partner update was logged for White Oak.', kind: 'organization' },
    { id: 'activity-4', date: '2026-08-28', message: 'Sam Lee attended Boys Club Fall.', kind: 'registration' },
  ],
};

export function createSeedState(): DemoState {
  const state = JSON.parse(JSON.stringify(seededState)) as DemoState;
  const slots = ['lead', 'coach-2', 'coach-3', 'coach-4', 'backup'] as const;
  state.assignments = state.sessions.flatMap((session) => session.coachIds.map((coachId, index) => ({
    id: `assignment-${session.id}-${slots[index] ?? 'backup'}`,
    sessionId: session.id,
    coachId,
    slot: slots[index] ?? 'backup',
    accepted: true,
  })));
  state.coaches = state.coaches.map((coach) => ({
    ...coach,
    assignmentIds: state.assignments.filter((assignment) => assignment.coachId === coach.id).map((assignment) => assignment.id),
  }));
  return state;
}
