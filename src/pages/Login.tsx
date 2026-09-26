import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { clsx } from 'clsx';

type Mode = 'login' | 'register';
type Step = 'phone' | 'otp';

export function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('phone');
  
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'register') {
        await api.post('/api/v1/auth/register/', { phone, role });
      }
      
      await api.post('/api/v1/auth/otp/request/', { phone });
      
      setStep('otp');
      setMessage('Код отправлен на ваш номер (дождитесь SMS)');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Ошибка. Проверьте правильность номера (напр. +373...)');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/v1/auth/otp/verify/', { phone, code: otpCode });
      
      const { access, refresh, role: userRole } = response.data;
      
      setAuth({ role: userRole || role }, access, refresh);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Неверный код. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">ServicePlace</span>
        </div>

        {step === 'phone' && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={clsx(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
                mode === 'login' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Вход
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); }}
              className={clsx(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
                mode === 'register' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Регистрация
            </button>
          </div>
        )}

        <h1 className="text-xl font-bold text-slate-900 text-center mb-6">
          {step === 'phone' ? (mode === 'login' ? 'С возвращением' : 'Создать аккаунт') : 'Ввод кода'}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-sm font-medium mb-6 text-center">
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={requestOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                placeholder="+373..."
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 mt-2">
                  Я хочу...
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="radio" 
                      name="role" 
                      value="customer" 
                      checked={role === 'customer'}
                      onChange={(e) => setRole(e.target.value as 'customer')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">Искать услуги</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input 
                      type="radio" 
                      name="role" 
                      value="provider" 
                      checked={role === 'provider'}
                      onChange={(e) => setRole(e.target.value as 'provider')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">Оказывать услуги</span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !phone}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 disabled:bg-slate-300 shadow-md"
            >
              {isLoading ? 'Загрузка...' : 'Продолжить'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 text-center">
                Код из SMS
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-4 bg-slate-100 border-none rounded-xl text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !otpCode}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 disabled:bg-slate-300 shadow-md"
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); setOtpCode(''); setMessage(''); }}
              className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Изменить номер телефона
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
