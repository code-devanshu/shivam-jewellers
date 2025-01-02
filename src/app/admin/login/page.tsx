import AdminLoginForm from "@/components/core/AdminLoginForm";

const AdminLogin = () => {
  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <div className="w-full max-w-md p-2">
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLogin;
