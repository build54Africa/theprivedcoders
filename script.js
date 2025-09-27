class FirstAidApp {
    constructor() {
        this.currentScreen = 'home';
        this.chatbot = new FirstAidChatbot();
        this.hospitalLocator = new HospitalLocator();
        this.initializeApp();
    }
    
    initializeApp() {
        this.bindEvents();
        this.renderHomeScreen();
        this.setupEmergencyButton();
    }
    
    bindEvents() {
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('chat-btn').addEventListener('click', () => this.showScreen('chat'));
        document.getElementById('hospitals-btn').addEventListener('click', () => this.showScreen('hospitals'));
        document.getElementById('emergency-btn').addEventListener('click', () => this.showScreen('emergency'));
        
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('chat-back-btn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('hospitals-back-btn').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('emergency-back-btn').addEventListener('click', () => this.showScreen('home'));
    }
    
    setupEmergencyButton() {
        const emergencyBtn = document.getElementById('emergency-btn');
        emergencyBtn.addEventListener('click', () => {
            emergencyBtn.style.animation = 'pulse 0.5s infinite';
            setTimeout(() => {
                emergencyBtn.style.animation = 'pulse 2s infinite';
            }, 2000);
        });
    }
    
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(`${screenName}-screen`).classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${screenName}-btn`).classList.add('active');
        
        this.currentScreen = screenName;
        
        if (screenName === 'home') {
            this.renderHomeScreen();
        } else if (screenName === 'chat') {
            this.chatbot.start();
        } else if (screenName === 'hospitals') {
            this.hospitalLocator.initializeMap();
        }
    }
    
    renderHomeScreen() {
        const guideList = document.getElementById('guide-list');
        guideList.innerHTML = '';
        
        Object.values(firstAidGuides).forEach(guide => {
            const card = document.createElement('div');
            card.className = 'guide-card';
            card.innerHTML = `
                <div class="icon">${guide.icon}</div>
                <h3>${guide.title}</h3>
                <p>${guide.description}</p>
            `;
            card.addEventListener('click', () => this.showGuide(guide.id));
            guideList.appendChild(card);
        });
    }
    
    showGuide(guideId) {
        const guide = firstAidGuides[guideId];
        if (!guide) return;
        
        const guideContent = document.getElementById('guide-content');
        guideContent.innerHTML = `
            <h2>${guide.icon} ${guide.title}</h2>
            <div class="steps">
                ${guide.steps.map((step, index) => `
                    <div class="step">
                        <div class="step-number">${index + 1}</div>
                        ${step}
                    </div>
                `).join('')}
            </div>
            <div class="emergency-note">
                <p><strong>Remember:</strong> Always call emergency services (1199) for serious medical emergencies.</p>
            </div>
        `;
        
        this.showScreen('guide');
    }
}

class FirstAidChatbot {
    constructor() {
        this.currentState = 'start';
        this.messageHistory = [];
    }
    
    start() {
        this.currentState = 'start';
        this.messageHistory = [];
        this.renderChat();
    }
    
    renderChat() {
        const chatMessages = document.getElementById('chat-messages');
        const chatOptions = document.getElementById('chat-options');
        
        chatOptions.innerHTML = '';
        this.renderMessageHistory(chatMessages);
        
        const currentStep = chatFlow[this.currentState];
        
        if (!currentStep) {
            this.showRestartOption();
            return;
        }
        
        if (!this.messageHistory.some(msg => msg.state === this.currentState)) {
            this.addMessage(currentStep.message, 'bot', this.currentState);
        }
        
        switch (currentStep.type) {
            case 'question':
                this.renderOptions(currentStep.options, chatOptions);
                break;
            case 'instruction':
                this.showNextStepButton(currentStep.next, chatOptions);
                break;
            case 'steps':
                this.renderStepByStep(currentStep, chatOptions);
                break;
        }
    }
    
    renderMessageHistory(container) {
        container.innerHTML = '';
        
        this.messageHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}-message ${msg.emergency ? 'emergency-message' : ''}`;
            messageDiv.innerHTML = this.formatMessage(msg.content);
            container.appendChild(messageDiv);
        });
        
        container.scrollTop = container.scrollHeight;
    }
    
    formatMessage(text) {
        return text.replace(/🆘/g, '<span style="font-size:1.2em">🆘</span>')
                  .replace(/✅/g, '<span style="font-size:1.2em">✅</span>')
                  .replace(/🚨/g, '<span style="font-size:1.2em">🚨</span>');
    }
    
    renderOptions(options, container) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chat-option';
            button.innerHTML = option.text;
            button.addEventListener('click', () => this.handleUserChoice(option.next));
            container.appendChild(button);
        });
    }
    
    showNextStepButton(nextState, container) {
        if (nextState) {
            const button = document.createElement('button');
            button.className = 'chat-option next-button';
            button.innerHTML = '➡️ Continue';
            button.addEventListener('click', () => {
                this.currentState = nextState;
                this.renderChat();
            });
            container.appendChild(button);
        }
        this.showRestartOption(container);
    }
    
    renderStepByStep(stepData, container) {
        const steps = stepData.guide ? firstAidGuides[stepData.guide].steps : stepData.steps;
        
        if (!steps) {
            console.error('No steps found for:', stepData);
            return;
        }
        
        container.innerHTML = '<div class="step-indicator">Preparing step-by-step instructions...</div>';
        this.showStepsSequentially(steps, stepData.next);
    }
    
    showStepsSequentially(steps, nextState) {
        const chatMessages = document.getElementById('chat-messages');
        
        setTimeout(() => {
            document.getElementById('chat-options').innerHTML = '';
        }, 500);
        
        steps.forEach((step, index) => {
            setTimeout(() => {
                const stepMessage = `📝 Step ${index + 1}: ${step}`;
                this.addMessage(stepMessage, 'bot', `step-${index}`);
                
                if (index === steps.length - 1) {
                    setTimeout(() => {
                        this.showStepCompletion(nextState);
                    }, 1000);
                }
            }, (index + 1) * 1500);
        });
    }
    
    showStepCompletion(nextState) {
        const chatOptions = document.getElementById('chat-options');
        chatOptions.innerHTML = '';
        
        if (nextState) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'chat-option success-button';
            continueBtn.innerHTML = '✅ Continue to next instructions';
            continueBtn.addEventListener('click', () => {
                this.currentState = nextState;
                this.renderChat();
            });
            chatOptions.appendChild(continueBtn);
        }
        
        this.showRestartOption(chatOptions);
    }
    
    handleUserChoice(nextState) {
        const currentStep = chatFlow[this.currentState];
        
        if (currentStep && currentStep.options) {
            const chosenOption = currentStep.options.find(opt => opt.next === nextState);
            if (chosenOption) {
                this.addMessage(chosenOption.text, 'user');
            }
        }
        
        this.currentState = nextState;
        this.renderChat();
    }
    
    addMessage(content, sender, stateId = null) {
        const isEmergency = content.includes('🆘');
        this.messageHistory.push({
            content: content,
            sender: sender,
            state: stateId,
            emergency: isEmergency,
            timestamp: new Date()
        });
        
        this.renderMessageHistory(document.getElementById('chat-messages'));
    }
    
    showRestartOption(container = null) {
        const targetContainer = container || document.getElementById('chat-options');
        const restartBtn = document.createElement('button');
        restartBtn.className = 'chat-option restart-button';
        restartBtn.innerHTML = '🔄 Start Over';
        restartBtn.addEventListener('click', () => this.start());
        targetContainer.appendChild(restartBtn);
    }
}

class HospitalLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userLocation = null;
        this.userMarker = null;
        this.currentRadius = 50;
        this.radiusCircle = null;
    }
    
    initializeMap() {
        if (!this.map) {
            this.map = L.map('hospital-map').setView(KENYA_CENTER, 6);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            this.setupEventListeners();
        }
        
        this.updateStatus('Map ready. Use your location or search for a town.');
        this.showKenyaOverview();
    }
    
    setupEventListeners() {
        document.getElementById('search-location').addEventListener('click', () => {
            this.searchByLocation();
        });
        
        document.getElementById('location-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchByLocation();
            }
        });
        
        document.getElementById('use-current-location').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        document.getElementById('hospital-filter').addEventListener('change', () => {
            this.filterHospitals();
        });
        
        document.getElementById('distance-filter').addEventListener('change', (e) => {
            this.currentRadius = parseInt(e.target.value);
            this.filterHospitals();
        });
    }
    
    searchByLocation() {
        const searchInput = document.getElementById('location-search').value.toLowerCase().trim();
        
        if (kenyaCounties[searchInput]) {
            const coordinates = kenyaCounties[searchInput];
            this.map.setView(coordinates, 10);
            this.displayHospitals(coordinates);
            this.updateStatus(`Showing hospitals near ${this.capitalizeFirst(searchInput)}`);
        } else {
            this.simulateGeocoding(searchInput);
        }
    }
    
    simulateGeocoding(locationName) {
        this.updateStatus(`Searching for "${locationName}"...`, 'loading');
        
        setTimeout(() => {
            const randomCoords = this.getRandomKenyaCoordinates();
            this.map.setView(randomCoords, 10);
            this.displayHospitals(randomCoords);
            this.updateStatus(`Showing hospitals near ${this.capitalizeFirst(locationName)} (approximate location)`);
        }, 1500);
    }
    
    getRandomKenyaCoordinates() {
        const minLat = -4.75;
        const maxLat = 5.0;
        const minLng = 33.5;
        const maxLng = 42.0;
        
        return [
            minLat + Math.random() * (maxLat - minLat),
            minLng + Math.random() * (maxLng - minLng)
        ];
    }
    
    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.updateStatus('Geolocation is not supported by your browser', 'error');
            return;
        }
        
        const button = document.getElementById('use-current-location');
        button.innerHTML = '📍 Locating...';
        button.disabled = true;
        this.updateStatus('Getting your location...', 'loading');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userCoords = [position.coords.latitude, position.coords.longitude];
                this.userLocation = userCoords;
                
                if (!this.isInKenya(userCoords)) {
                    this.updateStatus('Location appears to be outside Kenya. Showing Kenyan hospitals.', 'warning');
                }
                
                this.addUserMarker(userCoords);
                this.map.setView(userCoords, 10);
                this.displayHospitals(userCoords);
                
                button.innerHTML = '📍 Use My Current Location';
                button.disabled = false;
                
                this.updateStatus('Location found! Showing nearest hospitals in Kenya');
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location. ';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Unknown error occurred.';
                }
                
                this.updateStatus(errorMessage, 'error');
                this.showKenyaOverview();
                
                button.innerHTML = '📍 Use My Current Location';
                button.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    }
    
    isInKenya(coords) {
        const [lat, lng] = coords;
        return lat >= -4.75 && lat <= 5.0 && lng >= 33.5 && lng <= 42.0;
    }
    
    addUserMarker(coords) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        this.userMarker = L.marker(coords)
            .addTo(this.map)
            .bindPopup('Your Current Location')
            .openPopup();
        
        if (this.radiusCircle) {
            this.map.removeLayer(this.radiusCircle);
        }
        
        this.radiusCircle = L.circle(coords, {
            color: 'blue',
            fillColor: '#30a5ff',
            fillOpacity: 0.1,
            radius: this.currentRadius * 1000
        }).addTo(this.map);
    }
    
    displayHospitals(centerCoords) {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        if (this.radiusCircle) {
            this.map.removeLayer(this.radiusCircle);
        }
        
        this.radiusCircle = L.circle(centerCoords, {
            color: 'blue',
            fillColor: '#30a5ff',
            fillOpacity: 0.1,
            radius: this.currentRadius * 1000
        }).addTo(this.map);
        
        const hospitalsWithDistance = kenyaHospitals.map(hospital => {
            const distance = this.calculateDistance(centerCoords, hospital.coordinates);
            return { ...hospital, distance };
        }).sort((a, b) => a.distance - b.distance);
        
        hospitalsWithDistance.forEach(hospital => {
            const marker = L.marker(hospital.coordinates)
                .addTo(this.map)
                .bindPopup(`
                    <strong>${hospital.name}</strong><br>
                    <small>${hospital.county} County</small><br>
                    ${hospital.address}<br>
                    📞 ${hospital.phone}<br>
                    📍 ${hospital.distance.toFixed(1)} km away<br>
                    ${hospital.emergency ? '🆘 24/7 Emergency' : ''}
                `);
            
            this.markers.push(marker);
        });
        
        this.renderHospitalList(hospitalsWithDistance);
        this.updateMapInfo(centerCoords);
    }
    
    renderHospitalList(hospitals) {
        const resultsContainer = document.getElementById('hospitals-results');
        const nearbyHospitals = hospitals.filter(h => h.distance <= this.currentRadius);
        
        document.getElementById('results-count').textContent = nearbyHospitals.length;
        document.getElementById('search-radius').textContent = this.currentRadius;
        
        if (nearbyHospitals.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>🏥 No hospitals found within ${this.currentRadius} km</p>
                    <p><small>Try increasing the search radius or check nearby towns</small></p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = '';
        
        nearbyHospitals.forEach(hospital => {
            const hospitalItem = document.createElement('div');
            hospitalItem.className = 'hospital-item';
            hospitalItem.innerHTML = `
                <div class="hospital-meta">
                    <div>
                        <h4 class="hospital-name">${hospital.name}</h4>
                        <span class="hospital-type ${hospital.type}">${hospital.type}</span>
                        <span class="hospital-county">${hospital.county}</span>
                    </div>
                    <span class="distance-badge">${hospital.distance.toFixed(1)} km</span>
                </div>
                <p><strong>Address:</strong> ${hospital.address}</p>
                <p><strong>Phone:</strong> ${hospital.phone}</p>
                <p><strong>Services:</strong> ${hospital.services.slice(0, 3).join(', ')}</p>
                <p><strong>Rating:</strong> <span class="hospital-rating">${'★'.repeat(Math.floor(hospital.rating))}${'☆'.repeat(5-Math.floor(hospital.rating))}</span></p>
                ${hospital.emergency ? '<span class="emergency-badge">🆘 24/7 Emergency</span>' : ''}
            `;
            
            hospitalItem.addEventListener('click', () => {
                this.map.setView(hospital.coordinates, 12);
                document.querySelectorAll('.hospital-item').forEach(item => item.classList.remove('active'));
                hospitalItem.classList.add('active');
            });
            
            resultsContainer.appendChild(hospitalItem);
        });
    }
    
    filterHospitals() {
        const typeFilter = document.getElementById('hospital-filter').value;
        const center = this.userLocation || KENYA_CENTER;
        
        let filteredHospitals = kenyaHospitals.map(hospital => ({
            ...hospital,
            distance: this.calculateDistance(center, hospital.coordinates)
        }));
        
        if (typeFilter !== 'all') {
            filteredHospitals = filteredHospitals.filter(hospital => {
                if (typeFilter === 'emergency') return hospital.emergency;
                return hospital.type === typeFilter;
            });
        }
        
        filteredHospitals = filteredHospitals.filter(hospital => hospital.distance <= this.currentRadius);
        filteredHospitals.sort((a, b) => a.distance - b.distance);
        
        this.renderHospitalList(filteredHospitals);
        
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        filteredHospitals.forEach(hospital => {
            const marker = L.marker(hospital.coordinates)
                .addTo(this.map)
                .bindPopup(`
                    <strong>${hospital.name}</strong><br>
                    <small>${hospital.county} County</small><br>
                    📞 ${hospital.phone}<br>
                    📍 ${hospital.distance.toFixed(1)} km away
                `);
            this.markers.push(marker);
        });
    }
    
    showKenyaOverview() {
        this.map.setView(KENYA_CENTER, 6);
        this.displayHospitals(KENYA_CENTER);
    }
    
    updateMapInfo(centerCoords) {
        const mapInfo = document.getElementById('map-info');
        const radiusKm = document.getElementById('search-radius');
        radiusKm.textContent = this.currentRadius;
    }
    
    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status-text');
        const statusIcon = document.querySelector('.status-icon');
        
        statusElement.textContent = message;
        statusElement.className = type;
        
        switch (type) {
            case 'error':
                statusIcon.textContent = '❌';
                statusElement.style.color = '#dc3545';
                break;
            case 'loading':
                statusIcon.textContent = '⏳';
                statusElement.style.color = '#ffc107';
                break;
            case 'warning':
                statusIcon.textContent = '⚠️';
                statusElement.style.color = '#ffc107';
                break;
            default:
                statusIcon.textContent = '📍';
                statusElement.style.color = 'inherit';
        }
    }
    
    calculateDistance(coord1, coord2) {
        const [lat1, lon1] = coord1;
        const [lat2, lon2] = coord2;
        
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

function simulateCall(number) {
    alert(`Simulating call to ${number}\n\nIn a real emergency, this would dial the number directly.\n\nKenya Emergency Numbers:\n• 1199 - Ambulance\n• 999 - Police\n• 112 - General Emergency`);
}

document.addEventListener('DOMContentLoaded', () => {
    new FirstAidApp();
});