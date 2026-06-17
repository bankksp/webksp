import { useEffect } from 'react';
import { toast } from 'sonner';
import { onNewPost } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

export const useNewPostNotification = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onNewPost((posts: any[]) => {
      // Loop through up to 3 posts
      posts.forEach((post, index) => {
        const truncatedTitle = post.title?.length > 80 
          ? post.title.substring(0, 77) + '...' 
          : post.title;

        // Add slight delay for multiple toasts
        setTimeout(() => {
          toast.info('ข่าวสารใหม่!', {
            description: truncatedTitle,
            action: {
              label: 'อ่านข่าว',
              onClick: () => navigate(`/p/${post.id}`)
            },
            duration: 8000,
            className: 'scale-90 origin-bottom-right shadow-lg',
          });
        }, index * 500);
      });
    });

    return () => unsubscribe();
  }, [navigate]);
};

