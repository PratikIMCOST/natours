/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// export const updateSetting = async (form, type) => {
//   await form.addEventListener('submit', async (e) => {
//     try {
//       e.preventDefault();

//       const formInstence = new FormData(form);
//       formInstence.append('photo', document.querySelector('#photo').files[0]);
//       const formData = Object.fromEntries(formInstence);

//       const url = `/api/v1/users/${type === 'password' ? 'updatePassword' : 'updateMe'}`;
//       console.log(`Error: ${url}`);

//       //   send request to server
//       const res = await axios({
//         method: 'PATCH',
//         url,
//         data: formInstence,
//       });

//       if (res) {
//         showAlert('success', `${type.toUpperCase()} Updated!`);
//       }
//     } catch (err) {
//       console.log(err);
//       showAlert('error', err.response.data.message);
//     }
//   });
// };

export const updateSetting = async (data, type) => {
  try {
    const url = `/api/v1/users/${type === 'password' ? 'updatePassword' : 'updateMe'}`;

    //   send request to server
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res) {
      showAlert('success', `${type.toUpperCase()} Updated!`);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('success', `${err.response.data.message} Updated!`);
  }
};
