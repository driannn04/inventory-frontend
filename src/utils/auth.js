        export const getUser = ()=>{

        const user = localStorage.getItem("user");

        if(!user) return null;

        return JSON.parse(user);

        };

        export const getRole = ()=>{

        const user = getUser();

        return user?.role;

        };

        export const getUserId = ()=>{

        const user = getUser();

        return user?.id;

        };

        export const getToken = ()=>{

        return localStorage.getItem("token");

        };

        export const getPermissions = () => {
          const user = getUser();
          return user?.permissions || [];
        };