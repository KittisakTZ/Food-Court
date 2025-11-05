import React from 'react';

// Modern Order Card Component
const ModernOrderCard = ({
    orderNumber,
    date,
    time,
    items,
    total,
    status,
    customerAvatar
}) => {
    const getStatusColor = (status) => {
        const colors = {
            'PENDING': 'bg-yellow-100 border-yellow-300',
            'COMPLETED': 'bg-green-100 border-green-300',
            'REJECTED': 'bg-red-100 border-red-300',
            'COOKING': 'bg-orange-100 border-orange-300'
        };
        return colors[status] || 'bg-gray-100 border-gray-300';
    };

    const getStatusBadge = (status) => {
        const badges = {
            'PENDING': '⏱️',
            'COMPLETED': '✅',
            'REJECTED': '❌',
            'COOKING': '🍳'
        };
        return badges[status] || '📋';
    };

    return (
        <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${getStatusColor(status)} overflow-hidden`}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Order #{orderNumber}</h3>
                    <p className="text-sm text-gray-500">{date}, {time}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white shadow-lg">
                    <span className="text-lg">{customerAvatar}</span>
                </div>
            </div>

            {/* Order Items */}
            <div className="px-4 pb-4 space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <p className="text-sm font-bold text-orange-600">${item.price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Qty:</p>
                            <p className="text-lg font-bold text-gray-800">{item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t-2 border-gray-100">
                <div>
                    <p className="text-xs text-gray-500">X{items.length} Items</p>
                    <p className="text-lg font-black text-gray-800">${total}</p>
                </div>
                <div className="flex gap-2">
                    {status === 'PENDING' && (
                        <>
                            <button className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all">
                                <span className="text-xl">❌</span>
                            </button>
                            <button className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all">
                                <span className="text-xl">✅</span>
                            </button>
                        </>
                    )}
                    {status === 'COMPLETED' && (
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">
                            COMPLETED
                        </button>
                    )}
                    {status === 'REJECTED' && (
                        <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
                            REJECTED
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Demo with sample data
export default function OrderDashboard() {
    const sampleOrders = [
        {
            orderNumber: '351',
            date: '23 Feb 2021',
            time: '08:28 PM',
            status: 'PENDING',
            customerAvatar: '👨',
            total: '10.60',
            items: [
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Prawn Mix Salad',
                    description: 'Fresh Prawn mix salad',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            orderNumber: '350',
            date: '23 Feb 2021',
            time: '07:28 PM',
            status: 'PENDING',
            customerAvatar: '👩',
            total: '30.60',
            items: [
                {
                    name: 'Fresh Meat',
                    description: 'Fresh Meat with salad',
                    price: '25.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            orderNumber: '349',
            date: '23 Feb 2021',
            time: '08:28 PM',
            status: 'COMPLETED',
            customerAvatar: '👤',
            total: '10.60',
            items: [
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Prawn Mix Salad',
                    description: 'Fresh Prawn mix salad',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            orderNumber: '348',
            date: '23 Feb 2021',
            time: '08:28 PM',
            status: 'COOKING',
            customerAvatar: '👨‍🍳',
            total: '15.90',
            items: [
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Prawn Mix Salad',
                    description: 'Fresh Prawn mix salad',
                    price: '5.30',
                    quantity: 2,
                    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            orderNumber: '347',
            date: '23 Feb 2021',
            time: '07:28 PM',
            status: 'PENDING',
            customerAvatar: '🧑',
            total: '30.60',
            items: [
                {
                    name: 'Fresh Meat',
                    description: 'Fresh Meat with salad',
                    price: '25.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            orderNumber: '346',
            date: '23 Feb 2021',
            time: '08:28 PM',
            status: 'REJECTED',
            customerAvatar: '👩‍💼',
            total: '10.60',
            items: [
                {
                    name: 'Vegetable Mixups',
                    description: 'Vegetable Fritters with Egg',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop'
                },
                {
                    name: 'Prawn Mix Salad',
                    description: 'Fresh Prawn mix salad',
                    price: '5.30',
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-orange-100 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                f<span className="text-sm">oo</span>d
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800">ORDER LIST</h1>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-medium text-gray-700"
                            />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                                <span className="text-xl">🔔</span>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer">
                                <span className="text-lg">👤</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Number Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            ✓ #345
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            ✕ #346
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            ✓ #347
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            ✓ #348
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            ✓ #349
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-semibold shadow-lg whitespace-nowrap">
                            #350
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            #351
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            #352
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            #353
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap">
                            #354
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleOrders.map((order) => (
                        <ModernOrderCard key={order.orderNumber} {...order} />
                    ))}
                </div>
            </div>
        </div>
    );
}