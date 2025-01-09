export const isExtension = (): boolean => {
  return !!(window.chrome && chrome.runtime && chrome.runtime.id);
};

export const getEnvironmentType = (): 'extension' | 'web' => {
  return isExtension() ? 'extension' : 'web';
};

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}; 