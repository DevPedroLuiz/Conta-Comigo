const fs = require('fs');
let code = fs.readFileSync('src/modules/auth/pages/RegisterPage.tsx', 'utf8');

if (!code.includes('handleGoogleSignup')) {
  code = code.replace(
    `export function RegisterPage() {
  const { signup } = useAuth()`,
    `export function RegisterPage() {
  const { signup, loginWithGoogle } = useAuth()
  
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      toast.error("Erro ao fazer cadastro com Google");
    }
  }`
  );
  
  const googleBtn = `
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" className="w-full" disabled={isSubmitting} onClick={handleGoogleSignup}>
              Google
            </Button>
          </form>`;

  code = code.replace('</form>', googleBtn);
  fs.writeFileSync('src/modules/auth/pages/RegisterPage.tsx', code);
}
