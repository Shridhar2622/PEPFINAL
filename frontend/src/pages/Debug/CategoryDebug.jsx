import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useCategories } from '../../hooks/useServices';

const CategoryDebug = () => {
    const [axiosData, setAxiosData] = useState(null);
    const [axiosError, setAxiosError] = useState(null);
    const [fetchData, setFetchData] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const { data: hookData, error: hookError, isLoading: hookLoading } = useCategories();

    useEffect(() => {
        const runAxios = async () => {
            try {
                const res = await client.get('/categories');
                setAxiosData(res.data);
            } catch (err) {
                setAxiosError(err.message + ' ' + (err.response?.data?.message || ''));
            }
        };

        const runFetch = async () => {
            try {
                // Try raw fetch to bypass axios interceptors if any
                const res = await fetch('http://localhost:5000/api/v1/categories');
                const json = await res.json();
                setFetchData(json);
            } catch (err) {
                setFetchError(err.message);
            }
        };

        runAxios();
        runFetch();
    }, []);

    return (
        <div className="p-10 space-y-10 bg-white min-h-screen text-slate-900">
            <h1 className="text-3xl font-bold">Category Visibility Debugger</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-blue-600">1. useCategories Hook (React Query)</h2>
                {hookLoading && <p>Loading...</p>}
                {hookError && <p className="text-red-500">Error: {JSON.stringify(hookError)}</p>}
                <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-60 text-xs">
                    {JSON.stringify(hookData, null, 2)}
                </pre>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-green-600">2. Axios Direct Call (client.js)</h2>
                {axiosError && <p className="text-red-500">Error: {axiosError}</p>}
                <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-60 text-xs">
                    {JSON.stringify(axiosData, null, 2)}
                </pre>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-purple-600">3. Raw Fetch (http://localhost:5000/api/v1/categories)</h2>
                {fetchError && <p className="text-red-500">Error: {fetchError}</p>}
                <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-60 text-xs">
                    {JSON.stringify(fetchData, null, 2)}
                </pre>
            </section>

            <section className="space-y-4 border-t pt-4">
                <h2 className="text-xl font-bold">Analysis</h2>
                <ul className="list-disc pl-5">
                    <li>If <b>All 3</b> are empty/error: Backend is down or unreachable (CORS?).</li>
                    <li>If <b>Raw Fetch</b> works but others fail: <code>client.js</code> configuration is wrong.</li>
                    <li>If <b>All 3</b> show data but your Category is missing: Backend DB issue (check isActive).</li>
                    <li>If <b>All 3</b> show YOUR category: The issue is in the Component (Home/ServiceStack) display logic.</li>
                </ul>
            </section>
        </div>
    );
};

export default CategoryDebug;
