const firstAidGuides = {
    cpr: {
        id: 'cpr',
        title: 'CPR (Cardiopulmonary Resuscitation)',
        icon: '💓',
        description: 'For unconscious, non-breathing individuals',
        steps: [
            "Check the scene for safety and check the person. Tap their shoulder and shout 'Are you okay?'",
            "If unresponsive, call emergency services (911) immediately or ask someone to call",
            "Place the person on their back on a firm, flat surface",
            "Place the heel of one hand on the center of the person's chest (between the nipples)",
            "Place your other hand on top and interlock your fingers",
            "Position your shoulders directly over your hands and keep your arms straight",
            "Push down hard and fast - at least 2 inches deep at a rate of 100-120 compressions per minute",
            "After 30 compressions, give 2 rescue breaths (if trained and comfortable)",
            "Continue cycles of 30 compressions and 2 breaths until help arrives or the person shows signs of life"
        ]
    },
    choking: {
        id: 'choking',
        title: 'Choking - Adult',
        icon: '😮',
        description: 'When someone cannot breathe due to airway obstruction',
        steps: [
            "Ask the person: 'Are you choking?' If they can cough, speak, or breathe, encourage them to cough",
            "If they cannot breathe, cough, or speak, stand behind them and wrap your arms around their waist",
            "Make a fist with one hand and place the thumb side against the middle of their abdomen, just above the navel",
            "Grab your fist with your other hand and give quick, upward thrusts",
            "Continue abdominal thrusts until the object is dislodged or the person becomes unconscious",
            "If the person becomes unconscious, lower them to the ground and begin CPR"
        ]
    },
    burns: {
        id: 'burns',
        title: 'Burns',
        icon: '🔥',
        description: 'Thermal, chemical, or electrical burns',
        steps: [
            "Remove the person from the source of the burn",
            "Cool the burn with cool (not cold) running water for 10-20 minutes",
            "Remove any jewelry or tight clothing from the burned area before it swells",
            "Cover the burn with a sterile non-stick dressing or clean cloth",
            "Do not apply ice, butter, ointments, or break blisters",
            "Take over-the-counter pain reliever if needed",
            "Seek medical attention for severe burns, burns on face, hands, feet, or genitals, or chemical/electrical burns"
        ]
    },
    bleeding: {
        id: 'bleeding',
        title: 'Severe Bleeding',
        icon: '🩸',
        description: 'Control of significant blood loss',
        steps: [
            "Wear gloves if available to protect from bloodborne pathogens",
            "Have the person lie down and elevate the injured area if possible",
            "Apply direct pressure to the wound with a sterile dressing or clean cloth",
            "Maintain pressure until bleeding stops - do not remove the original dressing",
            "If blood soaks through, add more layers on top - do not remove existing ones",
            "Once bleeding stops, secure the dressing with a bandage",
            "If bleeding is severe and doesn't stop with direct pressure, apply pressure to the nearest artery (pressure point)",
            "Seek immediate medical attention for severe bleeding"
        ]
    },
    fracture: {
        id: 'fracture',
        title: 'Suspected Fracture',
        icon: '🦴',
        description: 'Possible broken bones',
        steps: [
            "Keep the person still and calm",
            "Do not try to straighten or realign the injured area",
            "If there is bleeding, control it with direct pressure (avoid pressing on the fracture)",
            "Apply ice packs wrapped in cloth to reduce swelling and pain",
            "If you must move the person, immobilize the injured area with splints or padding",
            "Seek medical attention for proper diagnosis and treatment",
            "Watch for signs of shock (pale, cold, clammy skin; rapid pulse)"
        ]
    },
    allergic: {
        id: 'allergic',
        title: 'Severe Allergic Reaction',
        icon: '🤧',
        description: 'Anaphylaxis emergency response',
        steps: [
            "Check if the person has an epinephrine auto-injector (EpiPen) and help them use it if needed",
            "Call emergency services immediately",
            "Have the person lie down on their back and elevate their feet",
            "Loosen tight clothing and cover them with a blanket",
            "If vomiting or having trouble breathing, have them lie on their side",
            "Do not give anything to drink",
            "Monitor breathing and be prepared to perform CPR if necessary",
            "Even if symptoms improve after epinephrine, medical evaluation is still necessary"
        ]
    }
};

const chatFlow = {
    start: {
        type: 'question',
        message: "🚨 What is the emergency situation? I'll guide you through it step by step.",
        options: [
            { text: "Someone is not breathing or unconscious", next: "breathing_check" },
            { text: "Someone is choking", next: "choking_check" },
            { text: "Someone has a burn", next: "burns_type" },
            { text: "Someone is bleeding severely", next: "bleeding_check" },
            { text: "Someone may have a broken bone", next: "fracture_check" },
            { text: "Severe allergic reaction", next: "allergic_check" }
        ]
    },
    breathing_check: {
        type: 'question',
        message: "Is the person breathing normally?",
        options: [
            { text: "No, they're not breathing at all", next: "call_emergency_cpr" },
            { text: "Yes, but they're unconscious", next: "recovery_position" },
            { text: "They're gasping or breathing oddly", next: "call_emergency_cpr" },
            { text: "I'm not sure how to check", next: "check_breathing_instructions" }
        ]
    },
    check_breathing_instructions: {
        type: 'instruction',
        message: "To check breathing: Look for chest movement, listen for breath sounds, and feel for air on your cheek. Do this for no more than 10 seconds.",
        next: "breathing_check"
    },
    call_emergency_cpr: {
        type: 'instruction',
        message: "🆘 Call emergency services (911) immediately! Put your phone on speaker so you can follow instructions while helping.",
        next: "cpr_instructions"
    },
    cpr_instructions: {
        type: 'steps',
        guide: 'cpr',
        next: "after_cpr"
    },
    after_cpr: {
        type: 'instruction',
        message: "Continue CPR until emergency services arrive or the person shows signs of life (breathing, movement). You're doing great!",
        next: null
    },
    recovery_position: {
        type: 'steps',
        message: "Place them in the recovery position to keep their airway open:",
        steps: [
            "Kneel beside them and place their arm nearest to you at a right angle to their body",
            "Bring their other hand across to rest against their cheek on the side nearest you",
            "Bend their far knee and gently roll them towards you",
            "Ensure their head is tilted back slightly to keep the airway open",
            "Stay with them and monitor breathing until help arrives"
        ],
        next: "monitor_breathing"
    },
    monitor_breathing: {
        type: 'instruction',
        message: "Monitor their breathing continuously. Check every minute. If their breathing stops, begin CPR immediately.",
        next: null
    },
    choking_check: {
        type: 'question',
        message: "Can the person cough, speak, or breathe?",
        options: [
            { text: "No, they cannot breathe or make sound", next: "choking_severe" },
            { text: "Yes, but they're struggling to breathe", next: "choking_mild" },
            { text: "I'm not sure", next: "choking_uncertain" }
        ]
    },
    choking_uncertain: {
        type: 'instruction',
        message: "Ask them: 'Are you choking?' If they can respond, encourage coughing. If they cannot speak or are turning blue, treat as severe choking.",
        next: "choking_check"
    },
    choking_severe: {
        type: 'steps',
        guide: 'choking',
        next: "after_choking_care"
    },
    choking_mild: {
        type: 'instruction',
        message: "Encourage them to keep coughing forcefully. Do not slap their back. Stay with them and be ready to act if it worsens.",
        next: "choking_progress"
    },
    choking_progress: {
        type: 'question',
        message: "What's happening now?",
        options: [
            { text: "They coughed up the object and can breathe normally", next: "choking_resolved" },
            { text: "It's getting worse - now they can't breathe", next: "choking_severe" },
            { text: "No change after 2-3 minutes", next: "seek_help_choking" }
        ]
    },
    burns_type: {
        type: 'question',
        message: "What type of burn is it?",
        options: [
            { text: "Heat or flame burn", next: "burns_heat" },
            { text: "Chemical burn", next: "burns_chemical" },
            { text: "Electrical burn", next: "burns_electrical" },
            { text: "Sunburn", next: "burns_sun" }
        ]
    },
    burns_heat: {
        type: 'steps',
        guide: 'burns',
        next: "burns_severity"
    },
    burns_severity: {
        type: 'question',
        message: "How severe does the burn appear?",
        options: [
            { text: "Small red area, minor pain (1st degree)", next: "burns_minor" },
            { text: "Large area, blisters, severe pain (2nd degree)", next: "seek_medical_burns" },
            { text: "White or charred skin, may not be painful (3rd degree)", next: "call_emergency_burns" }
        ]
    },
    burns_chemical: {
        type: 'instruction',
        message: "🆘 For chemical burns: Remove contaminated clothing carefully, brush off dry chemicals, then flush with large amounts of water. Call poison control (1-800-222-1222) and seek medical help.",
        next: null
    },
    burns_electrical: {
        type: 'instruction',
        message: "🆘 Electrical burns can cause internal damage not visible externally. Do not approach if the person is still in contact with the electrical source. Call emergency services immediately.",
        next: null
    },
    bleeding_check: {
        type: 'question',
        message: "Describe the bleeding:",
        options: [
            { text: "Steady flow, soaking through bandages quickly", next: "bleeding_severe" },
            { text: "Slow, oozing blood", next: "bleeding_minor" },
            { text: "Spurting blood (arterial bleeding)", next: "bleeding_arterial" },
            { text: "There's an object embedded in the wound", next: "embedded_object" }
        ]
    },
    bleeding_severe: {
        type: 'steps',
        guide: 'bleeding',
        next: "bleeding_monitor"
    },
    bleeding_arterial: {
        type: 'instruction',
        message: "🆘 This appears to be arterial bleeding - CALL EMERGENCY immediately! Apply extreme pressure directly on the wound. Do not remove pressure to check.",
        next: "bleeding_severe"
    },
    embedded_object: {
        type: 'instruction',
        message: "🆘 Do not remove the embedded object. Apply pressure around the object, not directly on it. Build up dressings around the object to stabilize it. Seek immediate medical help.",
        next: null
    },
    fracture_check: {
        type: 'question',
        message: "What makes you suspect a fracture?",
        options: [
            { text: "Visible deformity or bone protruding", next: "fracture_severe" },
            { text: "Heard a snap or pop, severe pain", next: "fracture_likely" },
            { text: "Swelling, bruising, difficulty moving", next: "fracture_possible" }
        ]
    },
    fracture_severe: {
        type: 'instruction',
        message: "🆘 For obvious fractures with deformity or protruding bone: Do not try to straighten. Control any bleeding. Keep the person still and call emergency services.",
        next: "fracture_general"
    },
    allergic_check: {
        type: 'question',
        message: "What symptoms is the person experiencing?",
        options: [
            { text: "Difficulty breathing, swelling of face/tongue", next: "allergic_severe" },
            { text: "Hives, itching, redness", next: "allergic_mild" },
            { text: "Dizziness, rapid pulse, confusion", next: "allergic_severe" }
        ]
    },
    allergic_severe: {
        type: 'steps',
        guide: 'allergic',
        next: null
    },
    choking_resolved: {
        type: 'instruction',
        message: "✅ Great! The person should still be checked by a doctor to ensure no injury occurred from the choking or first aid procedures.",
        next: null
    },
    burns_minor: {
        type: 'instruction',
        message: "✅ For minor burns: Keep the area clean, avoid breaking blisters, and monitor for signs of infection (increased redness, swelling, pus). Over-the-counter pain relievers may help.",
        next: null
    },
    bleeding_minor: {
        type: 'instruction',
        message: "✅ For minor bleeding: Clean the wound with mild soap and water, apply antibiotic ointment, and cover with a sterile bandage. Watch for signs of infection.",
        next: null
    },
    seek_help_choking: {
        type: 'instruction',
        message: "🆘 Seek medical help immediately if choking persists despite back blows and abdominal thrusts.",
        next: null
    },
    seek_medical_burns: {
        type: 'instruction',
        message: "🆘 Seek medical attention for burns larger than 3 inches, or on hands, feet, face, groin, or major joints.",
        next: null
    },
    call_emergency_burns: {
        type: 'instruction',
        message: "🆘 CALL EMERGENCY immediately for third-degree burns! Do not apply water. Cover with a clean, dry cloth.",
        next: null
    },
    bleeding_monitor: {
        type: 'instruction',
        message: "Monitor the bleeding. If it doesn't stop after 15 minutes of continuous direct pressure, or if the person shows signs of shock (pale, cold, dizzy), seek emergency medical help.",
        next: null
    },
    after_choking_care: {
        type: 'instruction',
        message: "Even if successful, the person should be checked by a doctor after abdominal thrusts as internal injuries can occur.",
        next: null
    },
    fracture_general: {
        type: 'steps',
        guide: 'fracture',
        next: null
    },
    fracture_likely: {
        type: 'instruction',
        message: "Likely fracture: Immobilize the area, apply ice wrapped in cloth, and seek medical attention. Do not try to realign the bone.",
        next: "fracture_general"
    },
    fracture_possible: {
        type: 'instruction',
        message: "Possible fracture: Rest the area, apply ice, elevate if possible, and see a doctor for proper diagnosis. If unable to bear weight or severe pain, seek emergency care.",
        next: "fracture_general"
    },
    allergic_mild: {
        type: 'instruction',
        message: "For mild allergic reactions: Antihistamines may help. Watch for worsening symptoms. If breathing difficulties develop, treat as severe reaction and seek emergency care.",
        next: null
    }
};