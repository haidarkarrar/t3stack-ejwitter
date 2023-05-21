import { type PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => {

    return (
        <main className="flex justify-center h-screen">
            <div className="h-full w-full md:max-w-2xl border-x border-slate-400 overflow-y-auto">
                {props.children}
            </div>
        </main>
    )
}

