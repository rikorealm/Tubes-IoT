import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePreferences } from '../contexts/UserContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    const currentPath = location.pathname.endsWith('/') && location.pathname.length > 1
      ? location.pathname.slice(0, -1)
      : location.pathname;
    const targetPath = path.endsWith('/') && path.length > 1
      ? path.slice(0, -1)
      : path;
    return currentPath === targetPath;
  };

  const { deviceAvailability } = usePreferences();

  const deviceAvailable = () => deviceAvailability === true;

  const iconPath = () => {
    if(isActive('/')){
      return 'M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z';
    }
    else if(isActive('/alert')){
      return 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16H120V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z';
    }
    else{
      return '';
    }
  };

  const pageTitle = () => {
    if (isActive('/')) { return 'Home'; }
    else if (isActive('/alert')) { return 'Alerts'; }
    else if (isActive('/profile')) { return 'Profile'; }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[var(--color-background)] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      {/* Header Section */}
      <div className="flex items-center bg-[var(--color-background)] p-4 pb-2 justify-evenly border-b border-[var(--color-background-darker)]">
        <div className="flex w-12 items-center justify-start"></div>
        <h2 className="text-[var(--color-primary)] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center"> { pageTitle() } </h2>
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={() => (isActive('/')) ? navigate('/add-edit-device') : navigate('/')}
            className={`${deviceAvailable() ? 'flex' : 'invisible'} max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[var(--color-accent)] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0`}
          >
            <div className="text-[var(--color-primary)]" data-icon="Gear" data-size="24px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d={iconPath()}
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area: This div will take all available vertical space and center its children */}
      <div className={`flex flex-1 ${(deviceAvailable() || isActive('/profile') || isActive('/alert')) ? 'items-start justify-start' : 'items-center justify-center' } w-full pb-[72px]`}>
        <Outlet/>
      </div>

      {/* Nav bar Section */}
      {/* <div className='mt-auto'> */}
        <div className="fixed bottom-0 left-0 z-50 w-full flex gap-2 border-t border-[var(--color-background-darker)] bg-[var(--color-background)] px-4 pb-3 pt-2">
          {/* Home Link */}
          <a
            onClick={() => navigate('/')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-full ${isActive('/') ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'}`}
          >
            <div className={`flex h-8 items-center justify-center`} data-icon="House" data-size="24px" data-weight="fill">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"
                ></path>
              </svg>
            </div>
          </a>
          {/* Bell Link (Notifications/Alerts) */}
          <a
            onClick={() => navigate('/alert')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/alert') ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'}`}
          >
            <div className={`flex h-8 items-center justify-center`} data-icon="Bell" data-size="24px" data-weight="fill">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M221.8,175.94A16,16,0,0,1,208,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM208,104a80,80,0,0,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200h160a16,16,0,0,0,13.8-24.06C216.25,166.38,208,139.33,208,104Z"
                ></path>
              </svg>
            </div>
          </a>
          {/* User Link (Profile/Settings) */}
          <a
            onClick={() => navigate('/profile')}
            className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/profile') ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'}`}
          >
            <div className={`flex h-8 items-center justify-center`} data-icon="User" data-size="24px" data-weight="fill">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path
                  d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
                ></path>
              </svg>
            </div>
          </a>
        </div>
    </div>
  );
};

export default Layout;