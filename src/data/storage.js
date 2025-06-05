export function saveProfileData(data) {
  localStorage.setItem('profileData', JSON.stringify(data));
}

export function loadProfileData() {
  const data = localStorage.getItem('profileData');
  return data ? JSON.parse(data) : null;
}