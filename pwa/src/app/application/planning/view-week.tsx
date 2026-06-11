import dayjs from 'dayjs';
import GridWeek from './grid-week';

const days = [
    {
        id: 1,
        name: "Lun",
        color: "red",
        dayoftheweek: 1
    },
    {
        id: 2,
        name: "Mar",
        color: "blue",
        dayoftheweek: 2
    },
    {
        id: 3,
        name: "Mer",
        color: "green",
        dayoftheweek: 3
    },
    {
        id: 4,
        name: "Jeu",
        color: "yellow",
        dayoftheweek: 4
    },
    {
        id: 5,
        name: "Ven",
        color: "purple",
        dayoftheweek: 5
    },
    {
        id: 6,
        name: "Sam",
        color: "pink",
        dayoftheweek: 6
    },
    {
        id: 7,
        name: "Dim",
        color: "orange",
        dayoftheweek: 7
    }

]
const startOfWeek = dayjs().startOf('isoWeek'); // Lundi de la semaine actuelle

export default function ViewWeek() {

    return (
        <div className="bg-sidebar p-3 rounded-lg">
            <div className="flex mb-3">
                <div className="w-11"></div>
                <div className="flex-1 grid grid-cols-7 divide-x">
                    <div className="col-span-4 col-start-2 bg-secondary/20 rounded-md text-xs px-2 border border-sidebar">
                        Christophe - Congés
                    </div>
                    <div className="col-span-3 col-start-4 bg-secondary/20 rounded-md text-xs px-2 border border-sidebar">
                        Christophe - Congés
                    </div>
                </div>
            </div>
            <div className="flex">
                <div>
                    <div className="h-14"></div>
                    {Array(24).fill(0).map((_, i) => (
                        <div key={i} className="h-12 text-xs">
                            {i}:00
                        </div>
                    ))}
                </div>
                <div className="w-3">
                    <div className="h-[17px]"></div>
                    <div className='divide-y'>
                        {Array(25).fill(0).map((_, i) => (
                            <div key={i} className="h-12">
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 relative">
                    <div className="grid grid-cols-7 divide-x divide-transparent">
                        {days.map((day, index) => <ColHeader day={day.name} key={day.id} index={index} />)}
                    </div>
                    <GridWeek />
                    <div className="grid grid-cols-7 divide-x border-l border-r">
                        {Array(7).fill(0).map((_, i) => (
                            <div key={i} className="h-3">
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 divide-x divide-y border-l border-r">
                        {days.map((day) => <Col key={day.id} />)}
                    </div>
                </div>
            </div>
        </div>
    )

}

const ColHeader = ({ day, index }: { day: string, index: number }) => {
    return (
        <div className="text-xs uppercase flex flex-col items-center justify-center gap-1">
            {day}{"."}
            <div className="text-xl font-light">
                <div className={`leading-3 rounded-full h-8 w-8 flex items-center justify-center ${startOfWeek.add(index, 'day').format('L') === dayjs().format('L') ? 'bg-secondary' : 'bg-transparent'}`}>
                    {startOfWeek.add(index, 'day').format('D')}
                </div>
            </div>
        </div>
    )
}

const Col = () => {
    return (
        <div className="text-xs text-center uppercase divide-y border-t border-b">
            {Array(24).fill(0).map((_, i) => (
                <div key={i} className="h-12">
                </div>
            ))}
        </div>
    )
}