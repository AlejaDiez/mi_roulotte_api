type Variables = {
    uid: string;
    username: string;
    role: "admin" | "editor" | "reader";
};

type Env = { Bindings: Bindings; Variables: Variables };
