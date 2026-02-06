// ===========================
// Data Storage Keys
// ===========================
const STORAGE_KEYS = {
    JOB_SEEKERS: 'jobSeekers',
    INVITATIONS: 'invitations',
    CURRENT_USER: 'currentUser',
    CURRENT_COMPANY: 'currentCompany'
};

// ===========================
// Sample Company Data
// ===========================
const COMPANIES = [
    { email: 'company@techcorp.com', password: 'demo123', name: 'TechCorp Solutions' },
    { email: 'hr@innovative.com', password: 'demo123', name: 'Innovative Industries' },
    { email: 'recruit@globaltech.com', password: 'demo123', name: 'Global Tech Ltd' }
];

// ===========================
// State Management
// ===========================
let currentUser = null;
let currentCompany = null;
let jobSeekers = [];
let invitations = [];

// ===========================
// Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    checkSession();
    updateUI();
});

// ===========================
// Load Data from localStorage
// ===========================
function loadData() {
    jobSeekers = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOB_SEEKERS)) || [];
    invitations = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVITATIONS)) || [];
    currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    currentCompany = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_COMPANY)) || null;
}

// ===========================
// Save Data to localStorage
// ===========================
function saveData() {
    localStorage.setItem(STORAGE_KEYS.JOB_SEEKERS, JSON.stringify(jobSeekers));
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.CURRENT_COMPANY, JSON.stringify(currentCompany));
}

// ===========================
// Event Listeners Setup
// ===========================
function setupEventListeners() {
    // Role Switcher
    document.getElementById('roleSwitcher').addEventListener('click', switchRole);
    
    // Job Seeker Form
    document.getElementById('jobSeekerForm').addEventListener('submit', handleJobSeekerRegistration);
    document.getElementById('loginLink').addEventListener('click', handleJobSeekerLogin);
    
    // Job Seeker Dashboard
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (editProfileBtn) editProfileBtn.addEventListener('click', handleEditProfile);
    
    // Company Form
    document.getElementById('companyLoginForm').addEventListener('submit', handleCompanyLogin);
    
    // Company Dashboard
    const companyLogoutBtn = document.getElementById('companyLogoutBtn');
    if (companyLogoutBtn) companyLogoutBtn.addEventListener('click', handleCompanyLogout);
    
    // Search and Filters
    const searchInput = document.getElementById('searchInput');
    const filterExperience = document.getElementById('filterExperience');
    const filterJobType = document.getElementById('filterJobType');
    
    if (searchInput) searchInput.addEventListener('input', filterCandidates);
    if (filterExperience) filterExperience.addEventListener('change', filterCandidates);
    if (filterJobType) filterJobType.addEventListener('change', filterCandidates);
    
    // Invitation Form
    document.getElementById('invitationForm').addEventListener('submit', handleSendInvitation);
    
    // Modal Close Buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// ===========================
// Role Switching
// ===========================
function switchRole() {
    const jobSeekerSection = document.getElementById('jobSeekerSection');
    const companySection = document.getElementById('companySection');
    const roleText = document.getElementById('roleText');
    
    if (jobSeekerSection.classList.contains('section-visible')) {
        jobSeekerSection.classList.remove('section-visible');
        jobSeekerSection.classList.add('section-hidden');
        companySection.classList.remove('section-hidden');
        companySection.classList.add('section-visible');
        roleText.textContent = 'Company';
        
        if (currentCompany) {
            showCompanyDashboard();
        }
    } else {
        companySection.classList.remove('section-visible');
        companySection.classList.add('section-hidden');
        jobSeekerSection.classList.remove('section-hidden');
        jobSeekerSection.classList.add('section-visible');
        roleText.textContent = 'Job Seeker';
        
        if (currentUser) {
            showJobSeekerDashboard();
        }
    }
}

// ===========================
// Check Session
// ===========================
function checkSession() {
    if (currentUser) {
        showJobSeekerDashboard();
    }
    if (currentCompany) {
        // Switch to company view if logged in
        const companySection = document.getElementById('companySection');
        if (!companySection.classList.contains('section-visible')) {
            switchRole();
        }
    }
}

// ===========================
// Job Seeker Registration
// ===========================
function handleJobSeekerRegistration(e) {
    e.preventDefault();
    
    const formData = {
        id: Date.now().toString(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        location: document.getElementById('location').value.trim(),
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        experience: document.getElementById('experience').value,
        jobType: document.getElementById('jobType').value,
        about: document.getElementById('about').value.trim(),
        registeredDate: new Date().toISOString()
    };
    
    // Check if email already exists
    if (jobSeekers.some(js => js.email === formData.email)) {
        alert('This email is already registered. Please login instead.');
        return;
    }
    
    jobSeekers.push(formData);
    currentUser = formData;
    saveData();
    
    document.getElementById('jobSeekerForm').reset();
    showJobSeekerDashboard();
    
    showNotification('Registration successful! Welcome to JobPortal.', 'success');
}

// ===========================
// Job Seeker Login
// ===========================
function handleJobSeekerLogin(e) {
    e.preventDefault();
    
    const email = prompt('Enter your registered email:');
    if (!email) return;
    
    const user = jobSeekers.find(js => js.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        currentUser = user;
        saveData();
        showJobSeekerDashboard();
        showNotification('Welcome back, ' + user.fullName + '!', 'success');
    } else {
        alert('Email not found. Please register first.');
    }
}

// ===========================
// Job Seeker Dashboard
// ===========================
function showJobSeekerDashboard() {
    document.getElementById('registrationContainer').classList.add('hidden');
    document.getElementById('jobSeekerDashboard').classList.remove('hidden');
    
    document.getElementById('userName').textContent = currentUser.fullName;
    
    displayJobSeekerInvitations();
}

function displayJobSeekerInvitations() {
    const invitationsList = document.getElementById('invitationsList');
    const userInvitations = invitations.filter(inv => inv.jobSeekerId === currentUser.id);
    
    if (userInvitations.length === 0) {
        invitationsList.innerHTML = '<div class="no-results">No invitations yet. Companies will reach out when they find your profile interesting!</div>';
        return;
    }
    
    invitationsList.innerHTML = userInvitations.map(inv => `
        <div class="invitation-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${inv.role}</div>
                    <div class="card-subtitle">${inv.companyName}</div>
                </div>
            </div>
            <div class="invitation-meta">
                <div class="card-info"><strong>Location:</strong> ${inv.location}</div>
                <div class="card-info"><strong>Job Type:</strong> ${inv.jobType}</div>
                <div class="card-info"><strong>Date:</strong> ${new Date(inv.date).toLocaleDateString()}</div>
            </div>
            <div class="invitation-message">
                "${inv.message}"
            </div>
        </div>
    `).join('');
}

// ===========================
// Edit Profile
// ===========================
function handleEditProfile() {
    document.getElementById('jobSeekerDashboard').classList.add('hidden');
    document.getElementById('registrationContainer').classList.remove('hidden');
    
    // Populate form with current data
    document.getElementById('fullName').value = currentUser.fullName;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('phone').value = currentUser.phone;
    document.getElementById('location').value = currentUser.location;
    document.getElementById('skills').value = currentUser.skills.join(', ');
    document.getElementById('experience').value = currentUser.experience;
    document.getElementById('jobType').value = currentUser.jobType;
    document.getElementById('about').value = currentUser.about;
    
    // Update job seeker on form submission
    const form = document.getElementById('jobSeekerForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        
        currentUser.fullName = document.getElementById('fullName').value.trim();
        currentUser.email = document.getElementById('email').value.trim();
        currentUser.phone = document.getElementById('phone').value.trim();
        currentUser.location = document.getElementById('location').value.trim();
        currentUser.skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s);
        currentUser.experience = document.getElementById('experience').value;
        currentUser.jobType = document.getElementById('jobType').value;
        currentUser.about = document.getElementById('about').value.trim();
        
        // Update in jobSeekers array
        const index = jobSeekers.findIndex(js => js.id === currentUser.id);
        if (index !== -1) {
            jobSeekers[index] = currentUser;
        }
        
        saveData();
        showJobSeekerDashboard();
        showNotification('Profile updated successfully!', 'success');
        
        // Reset form handler
        form.onsubmit = handleJobSeekerRegistration;
    };
}

// ===========================
// Logout
// ===========================
function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    document.getElementById('jobSeekerDashboard').classList.add('hidden');
    document.getElementById('registrationContainer').classList.remove('hidden');
    document.getElementById('jobSeekerForm').reset();
    
    showNotification('Logged out successfully!', 'success');
}

// ===========================
// Company Login
// ===========================
function handleCompanyLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('companyEmail').value.trim();
    const password = document.getElementById('companyPassword').value;
    
    const company = COMPANIES.find(c => c.email === email && c.password === password);
    
    if (company) {
        currentCompany = company;
        saveData();
        document.getElementById('companyLoginForm').reset();
        showCompanyDashboard();
        showNotification('Welcome, ' + company.name + '!', 'success');
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// ===========================
// Company Dashboard
// ===========================
function showCompanyDashboard() {
    document.getElementById('companyLoginContainer').classList.add('hidden');
    document.getElementById('companyDashboard').classList.remove('hidden');
    
    document.getElementById('companyName').textContent = currentCompany.name;
    
    displayCandidates(jobSeekers);
}

function displayCandidates(candidates) {
    const candidatesGrid = document.getElementById('candidatesGrid');
    const candidateCount = document.getElementById('candidateCount');
    
    candidateCount.textContent = candidates.length;
    
    if (candidates.length === 0) {
        candidatesGrid.innerHTML = '<div class="no-results">No candidates found matching your criteria.</div>';
        return;
    }
    
    candidatesGrid.innerHTML = candidates.map(candidate => `
        <div class="candidate-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${candidate.fullName}</div>
                    <div class="card-subtitle">${candidate.location}</div>
                </div>
            </div>
            
            <div class="skills-container">
                ${candidate.skills.slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                ${candidate.skills.length > 5 ? `<span class="skill-tag">+${candidate.skills.length - 5} more</span>` : ''}
            </div>
            
            <div class="card-info"><strong>Experience:</strong> ${candidate.experience}</div>
            <div class="card-info"><strong>Looking for:</strong> ${candidate.jobType}</div>
            <div class="card-info"><strong>Registered:</strong> ${new Date(candidate.registeredDate).toLocaleDateString()}</div>
            
            <div class="card-actions">
                <button class="btn btn-secondary btn-small" onclick="viewCandidateProfile('${candidate.id}')">View Profile</button>
                <button class="btn btn-primary btn-small" onclick="openInvitationModal('${candidate.id}')">Send Invitation</button>
            </div>
        </div>
    `).join('');
}

// ===========================
// Filter Candidates
// ===========================
function filterCandidates() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const experienceFilter = document.getElementById('filterExperience').value;
    const jobTypeFilter = document.getElementById('filterJobType').value;
    
    let filtered = jobSeekers.filter(candidate => {
        const matchesSearch = !searchTerm || 
            candidate.fullName.toLowerCase().includes(searchTerm) ||
            candidate.location.toLowerCase().includes(searchTerm) ||
            candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm));
        
        const matchesExperience = !experienceFilter || candidate.experience === experienceFilter;
        const matchesJobType = !jobTypeFilter || candidate.jobType === jobTypeFilter || candidate.jobType === 'Any';
        
        return matchesSearch && matchesExperience && matchesJobType;
    });
    
    displayCandidates(filtered);
}

// ===========================
// View Candidate Profile
// ===========================
function viewCandidateProfile(candidateId) {
    const candidate = jobSeekers.find(js => js.id === candidateId);
    if (!candidate) return;
    
    const profileDetails = document.getElementById('profileDetails');
    profileDetails.innerHTML = `
        <h2>${candidate.fullName}</h2>
        <div class="card-subtitle" style="margin-bottom: 1.5rem;">${candidate.email} | ${candidate.phone}</div>
        
        <div class="card-info" style="margin: 1rem 0;"><strong>Location:</strong> ${candidate.location}</div>
        <div class="card-info" style="margin: 1rem 0;"><strong>Experience:</strong> ${candidate.experience}</div>
        <div class="card-info" style="margin: 1rem 0;"><strong>Job Type Preference:</strong> ${candidate.jobType}</div>
        
        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Skills</h3>
        <div class="skills-container">
            ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        
        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">About</h3>
        <p style="color: var(--text-light); line-height: 1.8;">${candidate.about}</p>
        
        <div style="margin-top: 2rem;">
            <button class="btn btn-primary" onclick="openInvitationModal('${candidate.id}'); closeModal();">Send Invitation</button>
        </div>
    `;
    
    document.getElementById('profileModal').style.display = 'block';
}

// ===========================
// Open Invitation Modal
// ===========================
function openInvitationModal(candidateId) {
    document.getElementById('inviteJobSeekerId').value = candidateId;
    document.getElementById('invitationModal').style.display = 'block';
}

// ===========================
// Send Invitation
// ===========================
function handleSendInvitation(e) {
    e.preventDefault();
    
    const invitation = {
        id: Date.now().toString(),
        jobSeekerId: document.getElementById('inviteJobSeekerId').value,
        companyName: currentCompany.name,
        companyEmail: currentCompany.email,
        role: document.getElementById('jobRole').value.trim(),
        location: document.getElementById('jobLocation').value.trim(),
        jobType: document.getElementById('jobTypeInvite').value,
        message: document.getElementById('inviteMessage').value.trim(),
        date: new Date().toISOString()
    };
    
    invitations.push(invitation);
    saveData();
    
    document.getElementById('invitationForm').reset();
    closeModal();
    
    const candidate = jobSeekers.find(js => js.id === invitation.jobSeekerId);
    showNotification(`Invitation sent to ${candidate.fullName}!`, 'success');
}

// ===========================
// Company Logout
// ===========================
function handleCompanyLogout() {
    currentCompany = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_COMPANY);
    
    document.getElementById('companyDashboard').classList.add('hidden');
    document.getElementById('companyLoginContainer').classList.remove('hidden');
    document.getElementById('companyLoginForm').reset();
    
    showNotification('Logged out successfully!', 'success');
}

// ===========================
// Modal Controls
// ===========================
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// ===========================
// Notifications
// ===========================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #50C878 0%, #3DA35D 100%)' : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.4s ease-out;
        font-family: var(--font-body);
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Update UI
// ===========================
function updateUI() {
    // Additional UI updates can be added here
}
