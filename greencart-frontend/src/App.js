import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Truck, Package, DollarSign, Gauge, ChevronsRight, LogOut, Trash2, Edit, PlusCircle, Save, XCircle, Loader2 } from 'lucide-react';
import './App.css';

const GlobalStyles = () => (
  <style>{`
    @import url('[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap)');

    :root {
      --brand-green: #16a34a;
      --brand-dark: #1f2937;
      --brand-light: #f9fafb;
      --brand-blue: #4f46e5;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --border-color: #e5e7eb;
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: var(--brand-light);
      color: var(--text-primary);
    }
  `}</style>
);


// --- API HELPER ---
const api = {
    request: async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('greencart_token')}` };
        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
        }
        const response = await fetch(`http://localhost:5000/api${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API request failed');
        return data;
    },
    get: (endpoint) => api.request(endpoint),
    post: (endpoint, body) => api.request(endpoint, 'POST', body),
    put: (endpoint, body) => api.request(endpoint, 'PUT', body),
    delete: (endpoint) => api.request(endpoint, 'DELETE'),
};

const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('greencart_user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } catch (error) { console.error("Failed to parse user from localStorage", error); }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const { token, user } = await api.post('/auth/login', { username, password });
        localStorage.setItem('greencart_token', token);
        localStorage.setItem('greencart_user', JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('greencart_token');
        localStorage.removeItem('greencart_user');
        setUser(null);
    };

    if (loading) return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}><Loader2 style={{animation: 'spin 1s linear infinite', height: '3rem', width: '3rem', color: 'var(--brand-green)'}} /></div>;
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);

const DataContext = createContext(null);
const DataProvider = ({ children }) => {
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [simulationHistory, setSimulationHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [driversData, routesData, ordersData, historyData] = await Promise.all([
                api.get('/drivers'), api.get('/routes'), api.get('/orders'), api.get('/simulation/history')
            ]);
            setDrivers(driversData); setRoutes(routesData); setOrders(ordersData); setSimulationHistory(historyData);
        } catch (error) { console.error("Failed to fetch initial data:", error); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const crudHandler = (endpoint, setData, idField = '_id') => ({
        create: async (item) => { const newItem = await api.post(endpoint, item); setData(prev => [...prev, newItem]); },
        update: async (updatedItem) => { const returnedItem = await api.put(`${endpoint}/${updatedItem[idField]}`, updatedItem); setData(prev => prev.map(item => item[idField] === returnedItem[idField] ? returnedItem : item)); },
        delete: async (id) => { await api.delete(`${endpoint}/${id}`); setData(prev => prev.filter(item => item[idField] !== id)); },
    });

    const runSimulation = async (inputs) => {
        const { kpis } = await api.post('/simulation/run', inputs);
        setKpis({ ...kpis, lastRun: new Date() });
        fetchData();
    };

    const value = { drivers, driverActions: crudHandler('/drivers', setDrivers), routes, routeActions: crudHandler('/routes', setRoutes), orders, orderActions: crudHandler('/orders', setOrders), kpis, runSimulation, simulationHistory, loading };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
const useData = () => useContext(DataContext);

// COMPONENTS 
function KPI_Card({ icon, title, value, unit, color }) {
    return (
        <div className="kpi-card" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{padding: '1rem', borderRadius: '9999px', backgroundColor: color}}>{icon}</div>
            <div>
                <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500}}>
                    {title}
                </p>
                <p style={{fontSize: '1.875rem', color: 'var(--brand-dark)', fontWeight: 700}}>{value}
                    <span style={{fontSize: '1.25rem', fontWeight: 600}}>
                    {unit}
                    </span>
                </p>
            </div>
        </div>
    );
}

const Dashboard = () => {
    const { kpis } = useData();
    if (!kpis) return <div style={{textAlign: 'center', padding: '2.5rem', backgroundColor: 'white', borderRadius: '1rem'}}><h2 style={{fontSize: '1.5rem', fontWeight: 600}}>Welcome to GreenCart</h2><p style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>No simulation has been run yet. Please go to the Simulation page to start.</p></div>;
    
    const { totalProfit, efficiencyScore, onTimeCount, lateCount, fuelCostBreakdown, lastRun } = kpis;
    const deliveryData = [{ name: 'On-Time', value: onTimeCount }, { name: 'Late', value: lateCount }];
    const COLORS = ['#16a34a', '#f97316'];
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div>
                <h1 style={{fontSize: '1.875rem', fontWeight: 700}}>Dashboard</h1>
                <p style={{color: 'var(--text-secondary)'}}>Last simulation run: {new Date(lastRun).toLocaleString()}</p>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                <KPI_Card icon={<DollarSign style={{height: '2rem', width: '2rem', color: 'white'}} />} title="Total Profit" value={totalProfit.toLocaleString('en-IN')} unit=" ₹" color="#22c55e" />
                <KPI_Card icon={<Gauge style={{height: '2rem', width: '2rem', color: 'white'}} />} title="Efficiency Score" value={efficiencyScore.toFixed(1)} unit=" %" color="#3b82f6" />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                <div className="kpi-card"><h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Delivery Status</h3>{(onTimeCount > 0 || lateCount > 0) ? (<div className="chart-container"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deliveryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{deliveryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => `${value} deliveries`} /><Legend /></PieChart></ResponsiveContainer></div>) : (<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>No delivery data.</div>)}</div>
                <div className="kpi-card"><h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Fuel Cost Breakdown</h3>{fuelCostBreakdown.length > 0 ? (<div className="chart-container"><ResponsiveContainer width="100%" height="100%"><BarChart data={fuelCostBreakdown} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tickFormatter={(value) => `₹${value}`} /><Tooltip formatter={(value) => `₹${value.toFixed(2)}`} /><Legend /><Bar dataKey="cost" name="Fuel Cost" fill="var(--brand-blue)" /></BarChart></ResponsiveContainer></div>) : (<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>No fuel cost data.</div>)}</div>
            </div>
        </div>
    );
};

const Simulation = ({ navigate }) => {
    const { drivers, runSimulation, simulationHistory } = useData();
    const [inputs, setInputs] = useState({ numDrivers: drivers.length, startTime: '09:00', maxHours: 8 });
    const [error, setError] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    useEffect(() => { if (drivers.length > 0) { setInputs(i => ({...i, numDrivers: drivers.length}))}}, [drivers.length]);

    const handleRunSimulation = async (e) => {
        e.preventDefault();
        setError('');
        setIsSimulating(true);
        try {
            await runSimulation(inputs);
            navigate('Dashboard');
        } catch (err) { setError(err.message || 'Simulation failed.'); } finally { setIsSimulating(false); }
    };
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <h1 style={{fontSize: '1.875rem', fontWeight: 700}}>Run Simulation</h1>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
                <form onSubmit={handleRunSimulation} className="kpi-card" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}><h2 style={{fontSize: '1.25rem', fontWeight: 600}}>Simulation Parameters</h2><div><label htmlFor="numDrivers" className="form-label">Number of Available Drivers ({inputs.numDrivers})</label><input type="range" id="numDrivers" name="numDrivers" min="1" max={drivers.length || 1} value={inputs.numDrivers} onChange={(e) => setInputs({...inputs, numDrivers: parseInt(e.target.value)})} style={{width: '100%'}} /></div><div><label htmlFor="startTime" className="form-label">Route Start Time</label><input type="time" id="startTime" name="startTime" value={inputs.startTime} onChange={(e) => setInputs({...inputs, startTime: e.target.value})} className="form-input" /></div><div><label htmlFor="maxHours" className="form-label">Max Hours per Driver / Day ({inputs.maxHours})</label><input type="range" id="maxHours" name="maxHours" min="4" max="12" value={inputs.maxHours} onChange={(e) => setInputs({...inputs, maxHours: parseInt(e.target.value)})} style={{width: '100%'}} /></div><div><button type="submit" disabled={isSimulating || !drivers.length} className="btn btn-primary" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>{isSimulating ? <Loader2 style={{animation: 'spin 1s linear infinite'}} /> : <><ChevronsRight /> Run Simulation</>}</button></div>{error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}</form>
                <div className="kpi-card"><h2 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Simulation History</h2><div style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto'}}>{simulationHistory.length > 0 ? simulationHistory.map(sim => (<div key={sim._id} style={{padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid var(--border-color)'}}><p style={{fontWeight: 600}}>Run @ {new Date(sim.timestamp).toLocaleTimeString()}</p><p style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Profit: ₹{sim.kpis.totalProfit.toFixed(2)} | Efficiency: {sim.kpis.efficiencyScore.toFixed(1)}%</p></div>)) : (<p style={{color: 'var(--text-secondary)'}}>No recent simulations.</p>)}</div></div>
            </div>
        </div>
    );
};

const ManagementPage = ({ title, data, actions, fields, icon, idField = '_id' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const openModal = (item = null) => { setCurrentItem(item ? { ...item } : fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'number' ? 0 : '' }), {})); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setCurrentItem(null); };
    const handleSave = async (e) => { e.preventDefault(); const formData = new FormData(e.target); const newItem = { ...currentItem }; for (let [key, value] of formData.entries()) { if (!isNaN(value) && value !== '') newItem[key] = parseFloat(value); else if (value === 'true') newItem[key] = true; else if (value === 'false') newItem[key] = false; else newItem[key] = value; } if (newItem[idField]) { await actions.update(newItem); } else { await actions.create(newItem); } closeModal(); };
    const handleDelete = async (id) => { if (window.confirm('Are you sure?')) { await actions.delete(id); } };
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            {isModalOpen && <div className="modal-overlay"><div className="modal-content"><h2 style={{fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem'}}>{currentItem?.[idField] ? 'Edit' : 'Add'} {title.slice(0, -1)}</h2><form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>{fields.map(field => (<div key={field.name}><label className="form-label">{field.label}</label>{field.type === 'select' ? (<select name={field.name} defaultValue={currentItem?.[field.name]} className="form-input">{field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>) : (<input type={field.type || 'text'} name={field.name} defaultValue={currentItem?.[field.name]} className="form-input" />)}</div>))}<div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem'}}><button type="button" onClick={closeModal} className="btn" style={{backgroundColor: '#e5e7eb'}}><XCircle /> Cancel</button><button type="submit" className="btn btn-primary"><Save /> Save</button></div></form></div></div>}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><h1 style={{fontSize: '1.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>{icon} {title}</h1><button onClick={() => openModal()} className="btn btn-primary"><PlusCircle /> Add New</button></div>
            <div className="kpi-card" style={{padding: 0}}><div style={{overflowX: 'auto'}}><table><thead><tr>{fields.map(f => <th key={f.name}>{f.label}</th>)}<th>Actions</th></tr></thead><tbody>{data.map(item => (<tr key={item[idField]}>{fields.map(f => <td key={f.name}>{typeof item[f.name] === 'boolean' ? (item[f.name] ? 'Yes' : 'No') : item[f.name]}</td>)}<td><div style={{display: 'flex', gap: '0.5rem'}}><button onClick={() => openModal(item)} className="btn" style={{color: '#2563eb'}}><Edit /></button><button onClick={() => handleDelete(item[idField])} className="btn" style={{color: '#dc2626'}}><Trash2 /></button></div></td></tr>))}</tbody></table></div></div>
        </div>
    );
};

const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); setError(''); setIsLoading(true); try { await login(username, password); } catch (err) { setError(err.message || 'Invalid credentials'); } finally { setIsLoading(false); }};
    return (<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}><div style={{width: '100%', maxWidth: '28rem', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-md)'}}><div style={{textAlign: 'center'}}><Truck style={{height: '4rem', width: '4rem', margin: 'auto', color: 'var(--brand-green)'}} /><h1 style={{marginTop: '1rem', fontSize: '1.875rem', fontWeight: 700}}>GreenCart Logistics</h1><p style={{marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Manager Login</p></div><form style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}} onSubmit={handleSubmit}><div><input id="username" name="username" type="text" required className="form-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></div><div><input id="password" name="password" type="password" required className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>{error && <p style={{color: 'red', fontSize: '0.875rem', textAlign: 'center'}}>{error}</p>}<div><button type="submit" disabled={isLoading} className="btn btn-primary" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>{isLoading ? <Loader2 style={{animation: 'spin 1s linear infinite'}} /> : 'Sign in'}</button></div></form></div></div>);
};

const AppLayout = () => {
    const [page, setPage] = useState('Dashboard');
    const { user, logout } = useAuth();
    const { loading, drivers, driverActions, routes, routeActions, orders, orderActions } = useData();

    const renderPage = () => {
        if (loading) return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}><Loader2 style={{animation: 'spin 1s linear infinite', height: '3rem', width: '3rem', color: 'var(--brand-green)'}} /></div>;
        
        const driverFields = [
            { name: 'id_num', label: 'Driver ID', type: 'number' },
            { name: 'name', label: 'Name' },
            { name: 'shiftHours', label: 'Shift (hrs)', type: 'number' },
            { name: 'pastWeekHours', label: 'Past 7 Days (hrs)', type: 'number' },
            { name: 'isFatigued', label: 'Fatigued?', type: 'select', options: [{label: 'No', value: false}, {label: 'Yes', value: true}] }
        ];
        const routeFields = [
            { name: 'id_num', label: 'Route ID', type: 'number' },
            { name: 'name', label: 'Route Name' },
            { name: 'distance', label: 'Distance (km)', type: 'number' },
            { name: 'baseTime', label: 'Base Time (min)', type: 'number' },
            { name: 'traffic', label: 'Traffic', type: 'select', options: [{label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}] }
        ];
        const orderFields = [
            { name: 'id_num', label: 'Order ID', type: 'number' },
            { name: 'value', label: 'Value (₹)', type: 'number' },
            { name: 'routeId', label: 'Assigned Route', type: 'select', options: routes.map(r => ({label: r.name, value: r.id_num})) }
        ];

        switch (page) {
            case 'Dashboard': return <Dashboard />;
            case 'Simulation': return <Simulation navigate={setPage} />;
            case 'Drivers': return <ManagementPage title="Drivers" data={drivers} actions={driverActions} fields={driverFields} icon={<Users />} />;
            case 'Routes': return <ManagementPage title="Routes" data={routes} actions={routeActions} fields={routeFields} icon={<Truck />} />;
            case 'Orders': return <ManagementPage title="Orders" data={orders} actions={orderActions} fields={orderFields} icon={<Package />} />;
            default: return <Dashboard />;
        }
    };

    return (<div className="app-container">
                <aside className="sidebar">
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '5rem', borderBottom: '1px solid var(--border-color)'}}>
                        <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-green)'}}>
                            GreenCart
                        </h1>
                    </div>
                    <nav style={{flex: 1, padding: '1rem'}}>
                        <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <li ><a href="#dashboard" className={`nav-link ${page === 'Dashboard' ? 'active' : ''}`} onClick={() => setPage('Dashboard')}>📊 Dashboard</a></li>
                            <li ><a href="#simulation" className={`nav-link ${page === 'Simulation' ? 'active' : ''}`} onClick={() => setPage('Simulation')}>⚙️ Simulation</a></li>
                            <li style={{padding: '1rem 0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Management</li>
                            <li ><a href="#drivers" className={`nav-link ${page === 'Drivers' ? 'active' : ''}`} onClick={() => setPage('Drivers')}>👥 Drivers</a></li>
                            <li ><a href="#routes" className={`nav-link ${page === 'Routes' ? 'active' : ''}`} onClick={() => setPage('Routes')}>🚚 Routes</a></li>
                            <li ><a href="#orders" className={`nav-link ${page === 'Orders' ? 'active' : ''}`} onClick={() => setPage('Orders')}>📦 Orders</a></li>
                        </ul>
                    </nav>
                    <div style={{padding: '1rem', borderTop: '1px solid var(--border-color)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem'}}>
                            <div style={{ height: '40px',width: '40px',borderRadius: '50%',backgroundColor: 'var(--brand-green)',color: 'white',display: 'flex',alignItems: 'center',justifyContent: 'center',fontSize: '1.25rem',fontWeight: '600'}}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style={{fontWeight: 600, color: 'var(--text-primary)'}}>{user.name}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="btn" style={{width: '100%', backgroundColor: '#fee2e2', color: '#ef4444'}}><LogOut /> Logout</button>
                    </div>
                </aside>
                <main className="main-content">{renderPage()}</main>
            </div>);
};

const AppContent = () => {
    const { user } = useAuth();
    if (!user) return <LoginPage />;
    return <DataProvider><AppLayout /></DataProvider>;
};

export default function App() {
    return (
        <React.Fragment>
            <GlobalStyles />
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </React.Fragment>
    );
}