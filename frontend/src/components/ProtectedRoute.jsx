import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { token, user } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user?.role !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
