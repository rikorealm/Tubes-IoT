import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        background: 'linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("https://5.imimg.com/data5/SELLER/Default/2021/1/IY/TQ/ER/113666285/indoor-vertical-hydroponics-1000x1000.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    > 
      <div className='flex flex-col size-full min-h-screen backdrop-blur-[2px]'>
        <h1 className='flex justify-center items-center w-full pt-60 text-xl lg:text-3xl text-[#eefeec] font-extrabold tracking-wide'>Welcome to eHydroponic</h1>
        <h3 className='flex justify-center items-center w-full text-sm lg:text-xl text-[#bdd2b9] font-bold tracking-wide'>powered by IoT Class ITB</h3>
        <form 
          className='flex flex-1 h-full w-full justify-center items-center pb-60'
          onSubmit={handleLogin}>
            <div className='flex flex-col w-full justify-center items-center gap-6 lg:gap-10 px-[160px] xl:px-[200px] py-10 xl:py-[60px] max-w-[350px] lg:max-w-[520px] bg-white opacity-85 backdrop-blur-md! shadow-lg rounded-lg'>
              <h2 className='font-bold text-xl lg:text-3xl'>Login</h2>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" 
                className='p-2 w-[250px] lg:w-[320px] rounded-lg placeholder-[var(--color-accent)] border-b-1 shadow-none outline-0 rounded-b-none'
              />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"
                className='p-2 w-[250px] lg:w-[320px] rounded-lg placeholder-[var(--color-accent)] border-b-1 shadow-none outline-0 rounded-b-none'
              />
              <button 
                type="submit" 
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 lg:h-12 px-4 lg:px-15 mt-5
                              bg-[var(--color-background-darker)] text-[var(--color-accent)] text-sm lg:text-md font-bold leading-normal tracking-[0.015em]"
              >
                Login</button>
              <a onClick={() => navigate('/register')}
                className='font-thin text-xs lg:text-[1rem] w-[200px] text-center justify-center items-center'
              >
                No account? Register here</a>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Login;