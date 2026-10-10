import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Shield, Briefcase, User, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

type Role = 'customer' | 'provider';

export function Login() {
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setUser } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      setError('Не удалось получить Google ID Token. Попробуйте еще раз.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 4. POST /api/v1/auth/google/ с credential и выбранной ролью
      const response = await api.post('/api/v1/auth/google/', {
        credential,
        role,
      });

      // 5. Backend возвращает access, refresh, role, is_new_user
      const { access, refresh, role: returnedRole } = response.data;

      // 6. Сохраняем в Zustand store
      setAuth(
        {
          role: returnedRole || role,
        },
        access,
        refresh
      );

      // 8. После входа загружаем профиль GET /api/v1/me/
      try {
        const meRes = await api.get('/api/v1/me/');
        if (meRes.data) {
          setUser(meRes.data);
        }
      } catch (meError) {
        console.warn('Не удалось загрузить данные профиля /api/v1/me/:', meError);
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Ошибка входа через Google:', err);
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.errors?.detail ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Ошибка авторизации через Google. Пожалуйста, попробуйте еще раз.';
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Вход через Google был отменён или возникла ошибка соединения.');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        {/* Логотип */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">ServicePlace</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 text-center mb-2">Вход в систему</h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          Быстрая и безопасная авторизация через единый аккаунт Google
        </p>

        {/* 2. Выбор роли перед входом */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Выберите вашу роль
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={clsx(
                'flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left',
                role === 'customer'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
              )}
            >
              <User className={clsx('w-5 h-5 mb-1.5', role === 'customer' ? 'text-blue-600' : 'text-slate-400')} />
              <span className="text-xs font-bold">Заказчик</span>
              <span className="text-[10px] text-slate-500 text-center mt-0.5">Ищу услуги</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('provider')}
              className={clsx(
                'flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left',
                role === 'provider'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
              )}
            >
              <Briefcase className={clsx('w-5 h-5 mb-1.5', role === 'provider' ? 'text-blue-600' : 'text-slate-400')} />
              <span className="text-xs font-bold">Исполнитель</span>
              <span className="text-[10px] text-slate-500 text-center mt-0.5">Оказываю услуги</span>
            </button>
          </div>
        </div>

        {/* Ошибки */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-medium mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Основной сценарий «Войти через Google» */}
        <div className="flex flex-col items-center justify-center min-h-[50px]">
          {isLoading ? (
            <div className="py-3 flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Авторизация на сервере...</span>
            </div>
          ) : !googleClientId ? (
            <div className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs text-center">
              Укажите <code className="font-mono font-bold">VITE_GOOGLE_CLIENT_ID</code> в файле <code className="font-mono">.env</code> или панели Vercel для активации входа через Google.
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="340"
              />
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Данные защищены протоколом Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}
