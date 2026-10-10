import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { User, Phone, Mail, Shield, LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Валидация формата E.164: начинается с +, от 7 до 15 цифр, без пробелов
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export function Profile() {
  const queryClient = useQueryClient();
  const { user, setUser, logout } = useAuthStore();
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Загружаем актуальные данные профиля GET /api/v1/me/
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/me/');
      return data;
    },
    // Синхронизируем с локальным стором
    initialData: user || undefined,
  });

  useEffect(() => {
    if (profile) {
      setUser(profile);
      if (profile.phone) {
        setPhone(profile.phone);
      }
    }
  }, [profile, setUser]);

  // Мутация обновления профиля PATCH /api/v1/me/
  const updateProfileMutation = useMutation({
    mutationFn: async (newPhone: string) => {
      const payload = {
        phone: newPhone.trim() ? newPhone.trim() : null,
      };
      const { data } = await api.patch('/api/v1/me/', payload);
      return data;
    },
    onSuccess: (updatedData) => {
      setUser(updatedData);
      queryClient.setQueryData(['me'], updatedData);
      setSuccessMessage('Телефон успешно сохранён!');
      setPhoneError('');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.phone?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Не удалось сохранить телефон. Проверьте правильность формата.';
      setPhoneError(msg);
      setSuccessMessage('');
    },
  });

  const handlePhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setSuccessMessage('');

    const trimmed = phone.trim();

    // Поле необязательное: если пустое, сохраняем как null
    if (trimmed && !E164_REGEX.test(trimmed)) {
      setPhoneError('Номер должен быть в международном формате E.164 (например: +37368000000 или +79991234567)');
      return;
    }

    updateProfileMutation.mutate(trimmed);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const currentRole = profile?.role || user?.role;
  const roleName = currentRole === 'provider' ? 'Исполнитель (мастер)' : 'Заказчик (клиент)';
  const displayName = profile?.full_name || profile?.name || user?.name || profile?.email?.split('@')[0] || 'Пользователь';
  const displayEmail = profile?.email || user?.email;
  const avatarUrl = profile?.avatar || user?.avatar;

  if (isLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Загрузка профиля...</p>
      </div>
    );
  }

  if (isError && !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            {(error as any)?.response?.data?.detail || 'Ошибка загрузки профиля с сервера'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-2 pb-24 md:pb-8">
      {/* Шапка профиля */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-blue-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{displayName}</h1>
          {displayEmail && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{displayEmail}</span>
            </p>
          )}
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
            <Shield className="w-3 h-3 text-blue-600" />
            <span>{roleName}</span>
          </div>
        </div>
      </div>

      {/* Форма редактирования телефона */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          <span>Контактные данные</span>
        </h2>

        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Телефон для связи <span className="text-slate-400 font-normal">(необязательно)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError('');
                setSuccessMessage('');
              }}
              placeholder="+37368000000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Формат E.164: знак <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">+</code> и код страны без пробелов и дефисов.
            </p>
          </div>

          {phoneError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{phoneError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              'Сохранить изменения'
            )}
          </button>
        </form>
      </div>

      {/* Кнопка выхода */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}
