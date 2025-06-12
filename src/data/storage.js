export function saveProfileData(updatedFields) {
  const existing = loadProfileData() || {};
  const merged = { ...existing, ...updatedFields };
  localStorage.setItem('profileData', JSON.stringify(merged));
}

export function loadProfileData() {
  const data = localStorage.getItem('profileData');
  return data ? JSON.parse(data) : null;
}