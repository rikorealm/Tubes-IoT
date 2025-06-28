import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';


const Profile = () => {
    const user = auth.currentUser;
    return (
        <div className={`flex flex-col w-full h-[550px] justify-between items-start bg-[var(--color-primary)] -ml-10 mt-5 rounded-3xl drop-shadow-xl drop-shadow-[#5bb286]/50`}>
            <div className="flex items-center bg-[#f9fbfa] p-4 pr-30 pb-10 justify-between w-full -ml-5 mt-5 rounded-xl">
                <div className="flex items-stretch justify-between gap-4 rounded-xl pl-20">
                    <div className="flex flex-col gap-2 flex-[2_2_0px]">
                        <img
                            src="https://img.icons8.com/?size=100&id=ywULFSPkh4kI&format=png&color=0C2E17"
                            alt="User avatar"
                            className="w-12 h-12 rounded-full object-cover border-0 border-white shadow mb-2"
                        />
                        <p className="text-[var(--color-accent)] text-xl font-bold leading-tight"> { user.displayName } </p>
                        <p className="text-[var(--color-primary)] text-sm font-normal leading-normal"> { user.email } </p>
                    
                        <p className="text-[var(--color-primary)] text-sm font-normal leading-normal mt-3"> Account created since: </p>
                        <p className="text-[var(--color-primary)] text-sm font-normal leading-normal -mt-2"> { user.metadata.creationTime } </p>

                        <p className="text-[var(--color-primary)] text-sm font-normal leading-normal mt-3"> Last signed in: </p>
                        <p className="text-[var(--color-primary)] text-sm font-normal leading-normal -mt-2"> { user.metadata.lastSignInTime } </p>

                        <a className='text-[var(--color-primary)] text-sm font-normal leading-normal mt-3 underline'>Change password</a>

                        <a className='text-[var(--color-primary)] text-sm font-normal leading-normal -mt-2 underline'>Contact support</a>
                    </div>
                </div>
            </div>
            <div className="flex w-full pr-5 pb-5 justify-end items-center">
                <button
                    onClick={() => signOut(auth)}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 ml-10 bg-[#e9f1ec] text-[#101913] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                    <span className="truncate">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Profile