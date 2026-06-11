"use client";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
// import "./styles.css";


const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function GridWeek() {
    const [compactType, setcompactType] = useState("vertical");
    const [mounted, setmounted] = useState(false);
    const [layout, setlayout] = useState([
        { i: "a", x: 0, y: 0, w: 1, h: 4, isResizable: false },
        { i: "b", x: 1, y: 10, w: 1, h: 1, isResizable: false },
        { i: "c", x: 4, y: 10, w: 1, h: 2, isResizable: false },
        { i: "d", x: 0, y: 12, w: 1, h: 2, isResizable: false },
    ]);


    const mine = {
        a: true,
        b: false,
        c: false,
        d: true,
    }


    useEffect(() => {
        setmounted(true);
    }, []);

    const onDragStop = (layout, oldItem, newItem, placeholder, e, element) => {
        console.log("DRAG STOP");
        console.log("Item déplacé:", newItem);
    };


    const onDrop = (layout, layoutItem, _event) => {
        console.log("DROP", layoutItem, _event)
    }

    return (
        <div className="absolute top-16 left-0 z-20 w-full">
            <ResponsiveReactGridLayout
                rowHeight={12}
                maxRows={96}
                cols={{ lg: 7, md: 10, sm: 6, xs: 4, xxs: 2 }}
                margin={[2, 0]}
                layout={layout}
                onLayoutChange={(layout) => {
                    setlayout(layout);
                }}
                onDragStop={onDragStop}

                // WidthProvider option
                measureBeforeMount={false}
                // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
                // and set `measureBeforeMount={true}`.
                useCSSTransforms={mounted}
                preventCollision={!compactType}
                isDroppable={true}
                droppingItem={{ i: "xx", h: 50, w: 250 }}
                verticalCompact={false}
                draggableHandle=".drag-handle"
                allowOverlap={true}
                onDrop={onDrop}
            >
                {layout.map((itm, i) => (
                    <div
                        key={itm.i}
                        data-grid={itm}
                        className={`flex items-center justify-between rounded overflow-hidden ${mine[itm.i] ? "bg-primary" : "bg-primary/50"}`}
                    >
                        <div
                            className="text-xs cursor-pointer w-full p-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log(i);
                            }}
                        >
                            K.Tahri {itm.x}
                        </div>
                        <div className="drag-handle hover:cursor-move h-full flex items-center justify-end w-8 pr-[2px]">
                            <GripVertical size={12} color="white" />
                        </div>
                    </div>
                ))
                }
            </ResponsiveReactGridLayout >
        </div >
    );
}
