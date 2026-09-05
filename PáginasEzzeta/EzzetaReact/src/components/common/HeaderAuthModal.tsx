import { AnimatePresence, motion } from 'framer-motion';
import type { ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';

type AuthMode = 'login' | 'register';

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  phone: string;
  ruc: string;
};

type HeaderAuthModalProps = {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  loginIdentifier: string;
  loginPassword: string;
  loginError: string;
  isLoginSubmitting: boolean;
  onLoginIdentifierChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  registerForm: RegisterForm;
  registerError: string;
  isRegisterSubmitting: boolean;
  onRegisterChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const HeaderAuthModal = ({
  isOpen,
  mode,
  onClose,
  onModeChange,
  loginIdentifier,
  loginPassword,
  loginError,
  isLoginSubmitting,
  onLoginIdentifierChange,
  onLoginPasswordChange,
  onLoginSubmit,
  registerForm,
  registerError,
  isRegisterSubmitting,
  onRegisterChange,
  onRegisterSubmit,
}: HeaderAuthModalProps) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:px-4 sm:py-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute right-5 top-5 border border-black/10 p-2 text-black/70 hover:border-red-600 hover:text-red-600">
            <X size={18} />
          </button>
          <div className="mb-5 pr-12 text-center sm:mb-6 sm:text-left">
            {mode === 'login' ? (
              <>
                <p className="text-sm uppercase tracking-[0.3em] text-black/60">Iniciar sesión</p>
                <h2 className="mt-2 text-2xl font-semibold text-black sm:text-3xl">Acceso a tu cuenta</h2>
                <p className="mt-3 text-sm text-black/70">Inicia sesión para acceder a tus favoritos, direcciones guardadas y métodos de pago.</p>
              </>
            ) : (
              <>
                <p className="text-sm uppercase tracking-[0.3em] text-black/60">Registro de cuenta</p>
                <h2 className="mt-2 text-2xl font-semibold text-black sm:text-3xl">Crear cuenta</h2>
                <p className="mt-3 text-sm text-black/70">Registra tu cuenta y disfruta de beneficios exclusivos como favoritos y direcciones guardadas.</p>
              </>
            )}
          </div>

          {mode === 'login' ? (
            <form className="space-y-3 sm:space-y-4" onSubmit={onLoginSubmit}>
              <label className="block text-sm font-medium text-black" htmlFor="header-login-identifier">Correo electrónico</label>
              <input id="header-login-identifier" type="email" value={loginIdentifier} onChange={(event) => onLoginIdentifierChange(event.target.value)} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-red-500/20" placeholder="correo@empresa.com" required />
              <label className="block text-sm font-medium text-black" htmlFor="header-login-password">Contraseña</label>
              <input id="header-login-password" type="password" value={loginPassword} onChange={(event) => onLoginPasswordChange(event.target.value)} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-red-500/20" placeholder="••••••••" required />
              {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
              <button type="submit" className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-black/50" disabled={isLoginSubmitting}>{isLoginSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}</button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={onRegisterSubmit}>
              <label className="block text-sm font-medium text-black" htmlFor="header-register-username">Usuario</label>
              <input id="header-register-username" name="username" value={registerForm.username} onChange={onRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="Tu usuario" required />
              <label className="block text-sm font-medium text-black" htmlFor="header-register-email">Correo</label>
              <input id="header-register-email" name="email" type="email" value={registerForm.email} onChange={onRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="correo@empresa.com" required />
              <label className="block text-sm font-medium text-black" htmlFor="header-register-password">Contraseña</label>
              <input id="header-register-password" name="password" type="password" value={registerForm.password} onChange={onRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="••••••••" required />
              <label className="block text-sm font-medium text-black" htmlFor="header-register-phone">Teléfono</label>
              <input id="header-register-phone" name="phone" value={registerForm.phone} onChange={onRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="987654321" required />
              <label className="block text-sm font-medium text-black" htmlFor="header-register-ruc">DNI/RUC/CE (opcional)</label>
              <input id="header-register-ruc" name="ruc" value={registerForm.ruc} onChange={onRegisterChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="20600000000" />
              {registerError ? <p className="text-sm text-red-600">{registerError}</p> : null}
              <button type="submit" className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-black/50" disabled={isRegisterSubmitting}>{isRegisterSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>
              <p className="text-sm text-black/70">¿Ya tienes cuenta? <button type="button" onClick={() => onModeChange('login')} className="font-medium text-red-600 hover:text-red-700">Iniciar sesión</button></p>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs uppercase tracking-[0.25em] text-black/40">o</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>
          {mode === 'login' ? (
            <>
              <p className="text-center text-sm text-black/70 sm:text-left">¿No tienes cuenta aún?</p>
              <button type="button" onClick={() => onModeChange('register')} className="mt-4 block w-full rounded-full border border-black/10 bg-white px-4 py-3 text-center text-sm font-medium text-black transition hover:border-red-600 hover:text-red-600 sm:w-auto">Crear cuenta</button>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
