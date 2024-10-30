import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  FaThumbsUp,
  FaHeart,
  FaStar,
  FaEllipsisV,
  FaGlobe,
  FaLock,
} from "react-icons/fa";
import { Separator } from "../../../shadcn/separator";
import useReactions from "@/api/useReactions";
import PropTypes from "prop-types";

const SkeletonCount = () => (
  <div className="h-4 w-6 animate-pulse rounded bg-gray-300" />
);

const ReactionButton = ({ reaction, count, active, onClick }) => {
  const icons = {
    like: <FaThumbsUp size={24} />,
    love: <FaHeart size={24} />,
    celebrate: <FaStar size={24} />,
  };

  return (
    <div className="flex items-center space-x-1">
      <div
        className={`cursor-pointer ${active ? "text-blue-500" : "text-gray-400"}`}
        onClick={() => onClick(reaction)}
      >
        {icons[reaction]}
      </div>
      <span className="text-gray-600 dark:text-gray-300">{count}</span>
    </div>
  );
};

const ConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Confirm Deletion</h2>
        <p>Are you sure you want to delete this announcement?</p>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="mr-2 text-gray-600">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AnnouncementCard = ({
  post,
  handleReaction,
  onEdit,
  onDelete,
  userId,
}) => {
  const { reactions, loading, fetchReactions, userReaction } = useReactions(
    post.post_id,
    userId,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector(".menu");
      if (menu && !menu.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const getInitials = (fullName) => {
    if (!fullName) return "V";
    const names = fullName.split(" ");
    const initials =
      names.length >= 2
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : names[0][0];
    return initials.toUpperCase();
  };

  const handleIconClick = async (reaction) => {
    const newReaction = userReaction === reaction ? null : reaction;

    try {
      await handleReaction(post.post_id, newReaction);
      await fetchReactions();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const renderPostContent = (content) => {
    return content.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const confirmDelete = () => {
    onDelete(post.post_id);
    setIsDeleteDialogOpen(false);
  };

  const handleCloseImageModal = (event) => {
    if (event.target === event.currentTarget) {
      setIsImageModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
      {/* Post Header */}
      {post.group_name && (
        <p className="mb-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
          {post.group_name}
        </p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
          {post.post_header}
        </h2>
        <div className="flex items-center space-x-2">
          {post.public ? (
            <FaGlobe title="Public" className="text-green-500" />
          ) : (
            <FaLock title="Private" className="text-red-500" />
          )}
          {post.post_user_id === userId && (
            <div className="relative ml-2">
              <button
                onClick={toggleMenu}
                className="focus:outline-none"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <FaEllipsisV />
              </button>
              {menuOpen && (
                <div className="menu absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
                  <button
                    onClick={() => {
                      onEdit(post.post_id);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
        {renderPostContent(post.post_content)}
      </p>

      {/* Image Section */}
      {post.uploaded_image && (
        <div className="relative mb-4 h-48 w-full overflow-hidden">
          <img
            src={post.uploaded_image}
            alt="Post"
            className="h-full w-full cursor-pointer object-cover"
            onClick={() => setIsImageModalOpen(true)}
          />
        </div>
      )}

      {/* Edited Tag */}
      {post.edited && (
        <p className="mb-4 text-sm italic text-gray-500 dark:text-gray-400">
          This post was edited.
        </p>
      )}

      {/* User and Date Information */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        <div className="mr-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            {getInitials(post.user_name)}
          </div>
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {post.user_name}
          </span>
          <span className="ml-2">
            {format(new Date(post.created_at), "PP")}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          {/* Reactions */}
          <ReactionButton
            reaction="like"
            count={loading ? <SkeletonCount /> : reactions?.like || 0}
            active={userReaction === "like"}
            onClick={handleIconClick}
          />
          <ReactionButton
            reaction="love"
            count={loading ? <SkeletonCount /> : reactions?.love || 0}
            active={userReaction === "love"}
            onClick={handleIconClick}
          />
          <ReactionButton
            reaction="celebrate"
            count={loading ? <SkeletonCount /> : reactions?.celebrate || 0}
            active={userReaction === "celebrate"}
            onClick={handleIconClick}
          />
        </div>
        <Link
          to={`/volunteer-announcements-info/${post.post_id}`}
          className="text-xs text-blue-500 hover:underline sm:text-sm"
        >
          Read more
        </Link>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseImageModal}
        >
          <div className="relative rounded bg-white p-4">
            <img
              src={post.uploaded_image}
              alt="Full View"
              className="max-h-[90vh] max-w-[90vw] rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

AnnouncementCard.propTypes = {
  post: PropTypes.shape({
    post_id: PropTypes.string.isRequired,
    post_header: PropTypes.string.isRequired,
    post_content: PropTypes.string.isRequired,
    uploaded_image: PropTypes.string,
    edited: PropTypes.bool,
    created_at: PropTypes.string.isRequired,
    group_name: PropTypes.string,
    public: PropTypes.bool,
    user_id: PropTypes.string.isRequired,
    user_name: PropTypes.string.isRequired,
  }).isRequired,
  handleReaction: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default AnnouncementCard;
