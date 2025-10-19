import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { expensesAPI } from '../services/api';

/**
 * Expenses Page Component
 * Content-only component for expense management - no layout concerns
 * Renders inside DashboardLayout via React Router Outlet
 */

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await expensesAPI.getExpenses();
            if (response.success) {
                setExpenses(response.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                await expensesAPI.updateExpense(editingExpense._id, formData);
            } else {
                await expensesAPI.createExpense(formData);
            }
            setShowModal(false);
            setEditingExpense(null);
            setFormData({
                amount: '',
                description: '',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const categories = [
        'Rent', 'Utilities', 'Supplies', 'Marketing', 'Transportation',
        'Equipment', 'Maintenance', 'Insurance', 'Professional Services', 'Other'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                    <p className="text-gray-600">Track and manage your business expenses</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Expense
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0)}
                            </p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Entries</p>
                            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Expense</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{expenses.length > 0 ? Math.round(expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length) : 0}
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Expenses</h2>
                    <div className="flex gap-2">
                        <button className="btn-secondary flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading expenses...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No expenses recorded yet</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary mt-4"
                        >
                            Add First Expense
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(expense.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{expense.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingExpense(expense);
                                                        setFormData({
                                                            amount: expense.amount,
                                                            description: expense.description,
                                                            category: expense.category,
                                                            date: new Date(expense.createdAt).toISOString().split('T')[0]
                                                        });
                                                        setShowModal(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {editingExpense ? 'Edit Expense' : 'Add Expense'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingExpense(null);
                                        setFormData({
                                            amount: '',
                                            description: '',
                                            category: '',
                                            date: new Date().toISOString().split('T')[0]
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            className="input-field"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field"
                                        rows="3"
                                        placeholder="Describe the expense..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingExpense(null);
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingExpense ? 'Update Expense' : 'Add Expense'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
