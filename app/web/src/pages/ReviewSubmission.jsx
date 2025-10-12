import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { Star, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ReviewSubmission = () => {
    const { productId } = useParams(); // Assuming the route is /review/:productId
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- Data Fetching ---
    const { data: product, isLoading: isProductLoading, error: productError } = useQuery(
        ['productDetails', productId],
        async () => {
            const response = await axios.get(`/products/${productId}`);
            return response.data.product;
        },
        { enabled: !!productId }
    );

    // --- Mutation for Submission ---
    const reviewMutation = useMutation(
        (newReview) => axios.post(`/products/${productId}/reviews`, newReview),
        {
            onSuccess: () => {
                toast.success('Review submitted successfully! Thank you for your feedback.');
                // Invalidate query to refresh product details on other pages
                queryClient.invalidateQueries(['productDetails', productId]);
                
                // Navigate back to the orders list or the product page
                navigate('/orders'); 
            },
            onError: (error) => {
                const message = error.response?.data?.message || 'Failed to submit review.';
                toast.error(message);
            },
            onSettled: () => {
                setIsSubmitting(false);
            }
        }
    );

    // --- Handlers ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating before submitting.');
            return;
        }

        setIsSubmitting(true);
        reviewMutation.mutate({ rating, comment });
    };
    
    // --- Render Logic ---
    if (isProductLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }
    
    if (productError || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">Cannot find product to review.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Review: {product.name} - Sportify</title>
            </Helmet>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Order Details
                </button>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Review: {product.name}
                    </h1>
                    <p className="text-gray-600 mb-8">Share your experience with the product below.</p>

                    <div className="flex items-center space-x-4 mb-8 p-4 bg-blue-50 rounded-lg">
                        <img 
                            src={`${import.meta.env.VITE_SERVER_URL}${product.images?.[0]?.url || '/placeholder-product.jpg'}`} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Rating Input */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Your Rating *</label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <Star
                                        key={starValue}
                                        className={`w-10 h-10 cursor-pointer transition-colors ${
                                            starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                        }`}
                                        onClick={() => setRating(starValue)}
                                    />
                                ))}
                            </div>
                            {rating === 0 && <p className="text-red-500 text-sm mt-2">Please select a rating.</p>}
                        </div>

                        {/* Comment Input */}
                        <div className="mb-8">
                            <label htmlFor="comment" className="block text-lg font-semibold text-gray-800 mb-3">Your Review</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                                maxLength={500}
                                placeholder="What did you like or dislike? Max 500 characters."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {comment.length} / 500 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Star className="w-5 h-5 mr-2 fill-white" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ReviewSubmission;