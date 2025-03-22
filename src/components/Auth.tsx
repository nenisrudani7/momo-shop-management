import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './ui/Button';
import { BookDown as Bowl } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-700 via-pink-500 to-red-400 text-white">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center"
        >
          <Bowl className="h-16 w-16 text-white drop-shadow-lg" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-4xl font-bold drop-shadow-lg"
        >
          Momo Shop Management
        </motion.h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 w-full max-w-md px-6 sm:px-10"
      >
        <div className="bg-white/10 backdrop-blur-md p-8 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center bg-pink-500 hover:bg-pink-600 transition-all duration-300 shadow-lg py-3 rounded-lg font-semibold text-lg"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

