// hooks/useSettings.js (New File)
import { useQuery } from 'react-query';
import axios from 'axios';

const useSettings = () => {
    // Assuming your AdminSettings.jsx logic was corrected to fetch from /api/admin/settings
    const { data, isLoading, error } = useQuery(
        'globalSettings',
        async () => {
            const res = await axios.get('/admin/settings');
            return res.data.settings; // Assuming the structure is { success: true, settings: { currency: 'LKR', ... } }
        },
        {
            staleTime: Infinity, // Settings rarely change, so cache them indefinitely
        }
    );

    return {
        settings: data,
        isLoading,
        error,
    };
};

export default useSettings;