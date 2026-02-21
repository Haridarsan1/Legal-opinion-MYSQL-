export async function handleClientSignup(formData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}) {
  if (formData.password !== formData.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (!formData.agreeToTerms) {
    throw new Error('You must accept the Terms and Privacy Policy');
  }

  const signUpRes = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: 'client',
        },
      },
    }),
  });

  if (!signUpRes.ok) {
    const errorData = await signUpRes.json();
    throw new Error(errorData.error || 'Failed to create account');
  }

  const { user } = await signUpRes.json();
  
  if (!user) {
    throw new Error('Failed to create user account');
  }

  console.log('✅ Client account created:', user);
  return user;
}
