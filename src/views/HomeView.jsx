import React, {useState} from 'react';
import {CheckCircleIcon, LinkIcon, PlusCircleIcon, QuestionMarkCircleIcon} from '@heroicons/react/outline';
import EditModal from "../components/EditModal";
import ViewModal from "../components/ViewModal";

function Item(props) {
    const {
        title,
        enabledNotification,
        notificationStart,
        notificationEnd,
        resolved,
        onView,
        onResolve
    } = props;
    return (
        <div className="flex px-5 py-3 hover:bg-gray-100 w-full">
            <div
                className="flex-none w-10 mr-5 cursor-pointer"
                onClick={onResolve}
            >
                {
                    resolved
                        ? (<CheckCircleIcon title="已完成"/>)
                        : (<QuestionMarkCircleIcon title="未完成"/>)
                }
            </div>
            <div
                className="grow w-64 select-none cursor-pointer"
                onClick={onView}
            >
                <div className="text-black">{title}</div>
                {enabledNotification && (
                    <div className="text-gray-600">
                        已啟用提醒（{notificationStart}～{notificationEnd}）
                    </div>
                )}
            </div>
        </div>
    )
}

export default function HomeView(props) {
    const {db} = props;
    const [list, setList] = useState([]);
    const pinList = list.filter((i) => i.enabledPin);
    const [currentItem, setCurrentItem] = useState({});
    const [openViewModalValue, setOpenViewModalValue] = useState(false);
    const [openEditModalValue, setOpenEditModalValue] = useState(false);

    db
        .then(async (x) => setList(await x.transaction('items').store.getAll()))
        .catch((e) => console.error(e));

    const handleView = (i) => {
        setCurrentItem(i);
        setOpenViewModalValue(true);
    };
    const handleViewEdit = (i) => {
        setCurrentItem(i);
        setOpenEditModalValue(true);
    };
    const handleCloseModal = () => {
        setCurrentItem({});
    };
    const handleResolve = (i) => {
        i.resolved = !i.resolved;
        db
            .then(async (x) => {
                await x.transaction('items', 'readwrite').store.put(i);
            })
            .catch((e) => console.error(e));
    };

    return (
        <section className="flex-1 pt-3 md:p-6 lg:mb-0 lg:min-h-0 lg:min-w-0">
            {openViewModalValue && (
                <ViewModal
                    open={openViewModalValue}
                    onClose={handleCloseModal}
                    setOpen={setOpenViewModalValue}
                    db={db}
                    currentItem={currentItem}
                    onEdit={handleViewEdit}
                />
            )}
            {openEditModalValue && (
                <EditModal
                    open={openEditModalValue}
                    onClose={handleCloseModal}
                    setOpen={setOpenEditModalValue}
                    db={db}
                    currentItem={currentItem}
                />
            )}
            <div className="flex flex-col lg:flex-row h-full w-full">
                {pinList.length > 0 && (
                    <div
                        className="border mb-3 lg:pb-0 w-full lg:max-w-sm px-3 flex flex-row lg:flex-col flex-wrap lg:flex-nowrap bg-white">
                        <div className="flex text-gray-600 w-full py-3" title="釘選事項">
                            <LinkIcon className="h-5 w-5"/>
                            <span className="ml-1">板上釘釘</span>
                        </div>
                        {pinList.map((i) => (
                            <Item
                                key={i.id}
                                title={i.title}
                                description={i.description}
                                resolved={i.resolved}
                                onView={() => handleView(i)}
                                onResolve={() => handleResolve(i)}
                            />
                        ))}
                    </div>
                )}
                <div className="border h-full w-full lg:flex-1 px-3 min-h-0 min-w-0">
                    <div className="bg-white w-full h-full min-h-0 min-w-0 overflow-auto">
                        <div
                            className="flex px-5 py-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setOpenEditModalValue(true)}
                        >
                            <div className="flex-none w-10 mr-5">
                                <PlusCircleIcon title="新增"/>
                            </div>
                            <div className="grow w-64 select-none">
                                <div className="text-black">建立新的提醒事項</div>
                                <div className="text-gray-600">我還能提醒你更多更多 😊</div>
                            </div>
                        </div>
                        {list.map((i) => (
                            <Item
                                key={i.id}
                                title={i.title}
                                description={i.description}
                                resolved={i.resolved}
                                onView={() => handleView(i)}
                                onResolve={() => handleResolve(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
