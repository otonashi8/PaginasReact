import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterUserInput } from '../types/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterUserInput>({
    username: '',
    email: '',
    password: '',
    phone: '',
    ruc: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({
        ...form,
        ruc: form.ruc?.trim() || undefined,
      });
      navigate('/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo completar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="mb-5 text-center sm:mb-6 sm:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-black/60">Registro de cuenta</p>
          <h1 className="mt-2 text-2xl font-semibold text-black sm:text-3xl">Crear cuenta</h1>
          <p className="mt-3 text-sm text-black/70">Registra tu cuenta y disfruta de beneficios exclusivos como favoritos, libreta de direcciones y métodos de pago guardados.</p>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-black" htmlFor="username">Usuario</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="Tu usuario" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black" htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="correo@empresa.com" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="••••••••" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black" htmlFor="phone">Teléfono</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="987654321" required />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-black" htmlFor="ruc">RUC (opcional)</label>
            <input id="ruc" name="ruc" value={form.ruc} onChange={handleChange} className="w-full rounded-full border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black" placeholder="20600000000" />
          </div>

          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="md:col-span-2 w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-black/50" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-black/70">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </section>
  );
};
