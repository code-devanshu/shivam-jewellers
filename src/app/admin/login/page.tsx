import AdminLoginForm from "@/components/core/AdminLoginForm";

const AdminLogin = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLogin;
