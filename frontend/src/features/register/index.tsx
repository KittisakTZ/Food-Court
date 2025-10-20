// @/pages/register/index.tsx
import { useState } from "react";
import { postRegister } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterFeature() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!username || !password) {
            return alert("Please enter username and password.");
        }

        try {
            const response = await postRegister({ username, password, email, role });
            if (response.statusCode === 201) {
                alert("Registration successful! Please log in.");
                navigate("/login");
            } else {
                // แสดงข้อความ error จาก Backend
                alert(response.message || "Registration failed.");
            }
        } catch (error: any) {
            console.error("Error registering:", error);
            alert(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url('/images/bg-login.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fade-in">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Register</h2>
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Register as a:</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="BUYER"
                                    checked={role === 'BUYER'}
                                    onChange={() => setRole('BUYER')}
                                    className="h-4 w-4"
                                />
                                <span className="ml-2 text-gray-700">Buyer</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="SELLER"
                                    checked={role === 'SELLER'}
                                    onChange={() => setRole('SELLER')}
                                    className="h-4 w-4"
                                />
                                <span className="ml-2 text-gray-700">Seller</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="...">
                        Create Account
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-blue-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}