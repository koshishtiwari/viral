import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export const showToast = (type, title, message) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

export const showSuccessToast = (title, message) => {
  showToast('success', title, message);
};

export const showErrorToast = (title, message) => {
  showToast('error', title, message);
};

export const showWarningToast = (title, message) => {
  showToast('warning', title, message);
};

export const showInfoToast = (title, message) => {
  showToast('info', title, message);
};

export const showAlert = (title, message, buttons = []) => {
  const defaultButtons = [
    {
      text: 'OK',
      style: 'default',
    },
  ];
  
  Alert.alert(title, message, buttons.length > 0 ? buttons : defaultButtons);
};

export const showConfirmAlert = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        style: 'default',
        onPress: onConfirm,
      },
    ]
  );
};
