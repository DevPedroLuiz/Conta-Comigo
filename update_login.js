const fs = require('fs');
let code = fs.readFileSync('src/modules/auth/pages/LoginPage.tsx', 'utf8');

code = code.replace(
`export function LoginPage() {
  const { login } = useAuth()`,
`export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      toast.error("Erro ao fazer login com Google");
    }
  }`
);

code = code.replace(
`onClick={() => { const { loginWithGoogle } = useAuth(); loginWithGoogle() }}>`,
`onClick={handleGoogleLogin}>`
);

code = code.replace(
`<Button variant="outline" type="button" className="w-full" disabled={isSubmitting}>
              Google
            </Button>`,
`<Button variant="outline" type="button" className="w-full" disabled={isSubmitting} onClick={handleGoogleLogin}>
              Google
            </Button>`
);

fs.writeFileSync('src/modules/auth/pages/LoginPage.tsx', code);
