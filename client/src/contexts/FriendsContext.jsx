import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getFriendships, 
  setFriendships, 
  getInvitations, 
  setInvitations,
  getStorageItem,
  setStorageItem 
} from '../utils/storage';
import { getUserFriendsInfo } from '../utils/friendship';

const FriendsContext = createContext();

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export const FriendsProvider = ({ children, currentUser }) => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load friends data
  useEffect(() => {
    const loadFriendsData = () => {
      if (!currentUser) {
        setFriends([]);
        setGroups([]);
        setReceivedInvitations([]);
        setSentInvitations([]);
        setLoading(false);
        return;
      }

      try {
        // Load friends
        const friendsInfo = getUserFriendsInfo(currentUser.id);
        setFriends(friendsInfo);

        // Load test groups if available
        const testGroups = getStorageItem('testGroups', []);
        setGroups(testGroups);

        // Load invitations
        const received = getInvitations('received').filter(
          inv => inv.receiverId === currentUser.id
        );
        const sent = getInvitations('sent').filter(
          inv => inv.senderId === currentUser.id
        );

        setReceivedInvitations(received);
        setSentInvitations(sent);
      } catch (error) {
        console.error('Error loading friends data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadFriendsData();
    };

    const handleFriendshipsCleared = () => {
      setFriends([]);
      setReceivedInvitations([]);
      setSentInvitations([]);
    };

    const handleTestDataGenerated = (e) => {
      if (e.detail.groups) {
        setGroups(e.detail.groups);
      }
    };

    const handleTestDataRemoved = () => {
      setGroups([]);
    };

    window.addEventListener('localStorageUpdate', handleStorageChange);
    window.addEventListener('friendshipsCleared', handleFriendshipsCleared);
    window.addEventListener('testDataGenerated', handleTestDataGenerated);
    window.addEventListener('testDataRemoved', handleTestDataRemoved);

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageChange);
      window.removeEventListener('friendshipsCleared', handleFriendshipsCleared);
      window.removeEventListener('testDataGenerated', handleTestDataGenerated);
      window.removeEventListener('testDataRemoved', handleTestDataRemoved);
    };
  }, [currentUser]);

  const addFriend = (friendship) => {
    const currentFriendships = getFriendships();
    const updatedFriendships = [...currentFriendships, friendship];
    setFriendships(updatedFriendships);
  };

  const removeFriend = (friendshipId) => {
    const currentFriendships = getFriendships();
    const updatedFriendships = currentFriendships.filter(f => f.id !== friendshipId);
    setFriendships(updatedFriendships);
  };

  const sendInvitation = (invitation) => {
    const currentSent = getInvitations('sent');
    const updatedSent = [...currentSent, invitation];
    setInvitations('sent', updatedSent);
    setSentInvitations(updatedSent.filter(inv => inv.senderId === currentUser?.id));
  };

  const acceptInvitation = (invitationId) => {
    const currentReceived = getInvitations('received');
    const invitation = currentReceived.find(inv => inv.id === invitationId);
    
    if (invitation) {
      // Create friendship
      const friendship = {
        id: Date.now().toString(),
        userId1: invitation.senderId,
        userId2: invitation.receiverId,
        createdAt: new Date().toISOString(),
      };
      addFriend(friendship);

      // Remove invitation
      const updatedReceived = currentReceived.filter(inv => inv.id !== invitationId);
      setInvitations('received', updatedReceived);
      setReceivedInvitations(updatedReceived.filter(inv => inv.receiverId === currentUser?.id));
    }
  };

  const declineInvitation = (invitationId) => {
    const currentReceived = getInvitations('received');
    const updatedReceived = currentReceived.filter(inv => inv.id !== invitationId);
    setInvitations('received', updatedReceived);
    setReceivedInvitations(updatedReceived.filter(inv => inv.receiverId === currentUser?.id));
  };

  const cancelInvitation = (invitationId) => {
    const currentSent = getInvitations('sent');
    const updatedSent = currentSent.filter(inv => inv.id !== invitationId);
    setInvitations('sent', updatedSent);
    setSentInvitations(updatedSent.filter(inv => inv.senderId === currentUser?.id));
  };

  const clearAllData = () => {
    setFriends([]);
    setGroups([]);
    setReceivedInvitations([]);
    setSentInvitations([]);
    
    // Clear from storage
    setFriendships([]);
    setInvitations('received', []);
    setInvitations('sent', []);
    setStorageItem('testGroups', []);
  };

  const value = {
    friends,
    groups,
    receivedInvitations,
    sentInvitations,
    loading,
    addFriend,
    removeFriend,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    clearAllData,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};

FriendsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  currentUser: PropTypes.object,
};