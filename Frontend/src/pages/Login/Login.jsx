import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../utils/api';
import { UserContext } from '../../contexts/UserContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthAnimation from '../../components/Animation/AuthAnimation';

const Login = () => {
  const navigate = useNavigate();
  const { setisLogedin, setuserDetail } = useContext(UserContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.password.trim()) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const response = await loginUser(formData);
      localStorage.setItem('token', response.data.accessToken);
      if (response.success) {
        setisLogedin(true);
        setuserDetail(response.data.user);
        navigate('/', { replace: true });
      } else {
        toast.error(response.message || 'Login failed!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white text-black">
    <div className="hidden md:flex flex-1 items-center justify-center">
      <AuthAnimation />
    </div>

    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white border border-orange-500 p-8 rounded-2xl shadow-lg w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-orange-500">Welcome Back</h2>
          <p className="text-sm text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email.toLowerCase()}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-1 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-5">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-orange-500 font-medium cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  </div>
);

};

export default Login;
