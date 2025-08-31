// LoginForm.jsx contiene il form per effettuare il login

function LoginForm() {
  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-3 rounded-lg border border-green-500 bg-transparent text-green-500 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-3 rounded-lg border border-green-500 bg-transparent text-green-500 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button className="w-full py-3 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition">
        Login
      </button>
    </div>
  );
}

export default LoginForm;