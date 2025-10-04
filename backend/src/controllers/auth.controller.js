const supabase = require('../utils/supabase');

/**
 * Login user with Google OAuth
 */
exports.login = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: access_token
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(200).json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(201).json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const { id } = req.user;
    
    // Get user profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, avatar_url } = req.body;
    
    // Update profile in database
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
