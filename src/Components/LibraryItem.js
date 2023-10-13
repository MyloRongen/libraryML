import axios from "axios";
import React, {useEffect, useState} from "react";

export function LibraryItem() {
    const [content, setContent] = useState(<LibraryItemList showForm={showForm}/>);

    function showList(){
        setContent(<LibraryItemList showForm={showForm} />);
    }

    function showForm(libraryItem){
        setContent(<LibraryItemForm libraryItem={libraryItem} showList={showList} />);
    }

    return (
        <div className="px-20 pt-10">
            {content}
        </div>
    );
}

function LibraryItemForm(props){
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageSrc, setImageSrc] = useState("");

    useEffect(() => {
        if (props.libraryItem != null){
            editLibraryItem(props.libraryItem).then(r => null);
        }
    }, [props.libraryItem]);

    async function save(event) {
        event.preventDefault();
        try {
            const formData = new FormData();

            formData.append('name', name);
            formData.append('imageUrl', imageUrl);
            formData.append('imageFile', imageFile);

            await axios.post("https://localhost:7171/api/LibraryItem/AddLibraryItem", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            document.getElementById('image-uploader').value = null;

            alert("Library item is successfully created");

            setId("");
            setName("");
            setImageUrl("");
            setImageFile("");
            setImageSrc("");

            props.showList();
        } catch (err) {
            alert(err);
        }
    }

    async function editLibraryItem(libraryItem) {
        setName(libraryItem.name);
        setImageUrl(libraryItem.imageUrl);

        setId(libraryItem.id);
    }

    async function update(event) {
        event.preventDefault();
        try {
            const formData = new FormData();

            formData.append('id', props.libraryItem.id);
            formData.append('name', name);
            formData.append('imageUrl', imageUrl);
            formData.append('imageFile', imageFile);

            await axios.put("https://localhost:7171/api/LibraryItem/UpdateLibraryItem/" + props.libraryItem.id || id, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert("Library item updated");

            setId("");
            setName("");
            setImageUrl("");
            setImageFile("");
            setImageSrc("");

            props.showList();
        } catch (err) {
            alert(err);
        }
    }

    const showPreview = (e) => {
        if (e.target.files && e.target.files[0]) {
            const imageFile = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                setImageFile(imageFile);
                setImageSrc(event.target.result);
            };

            reader.readAsDataURL(imageFile);
        }
    };

    return(
        <div className="mt-4">
            <button onClick={() => props.showList()} className="bg-blue-400 text-white py-2 px-4 rounded-md mb-10">Back</button>

            <h1 className="mt-4 text-4xl">Create Library Item</h1>

            <form className="pt-6">
                <div>
                    {props.libraryItem.id ?
                        <input type="text" className="form-control" id="id" hidden
                        defaultValue={props.libraryItem.id} onChange={(event) => {
                        setId(event.target.value);
                        }}/>
                        :
                        null
                    }

                    <label>Name</label>
                    <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" id="name"
                        defaultValue={props.libraryItem.name} onChange={(event) => {
                        setName(event.target.value);
                    }}/>
                </div>
                <div className="pt-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={showPreview}
                    />
                    {imageSrc !== "" ? (
                        <img
                            src={imageSrc}
                            alt="image"
                            id="image-uploader"
                            className=""
                            style={{ maxHeight: '300px' }}
                        />
                    ) : (
                        <img
                            src={props.libraryItem.imageSrc}
                            alt="different image"
                            id="different-image"
                            className=""
                            style={{ maxHeight: '300px' }}
                        />
                    )}
                </div>
                <div className="flex justify-end w-full gap-2 pt-6">
                    <div>
                        {props.libraryItem.id ?
                            <button className="w-96 bg-blue-400 text-white py-2 px-4 rounded-md" onClick={update}>
                                Update
                            </button>
                            :
                            <button className="w-96 bg-blue-400 text-white py-2 px-4 rounded-md" onClick={save}>
                                Create library item
                            </button>
                        }
                    </div>
                </div>
            </form>
        </div>
    );
}

function LibraryItemList(props){
    const [libraryItems, setLibraryItems] = useState([]);

    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        let result = await axios.get("https://localhost:7171/api/LibraryItem/GetLibraryItem");

        setLibraryItems(result.data);
        console.log(result.data);
    }

    async function DeleteLibraryItem(id) {
        await axios.delete("https://localhost:7171/api/LibraryItem/DeleteLibraryItem/" + id);
        alert("Employee deleted Successfully");

        Load();
    }

    return(
        <div className="overflow-x-auto pt-10">
            <div className="flex justify-end w-full">
                <button onClick={() => props.showForm({})} className=" bg-blue-400 mb-4 text-white py-2 px-4 rounded-md">Create library item</button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Option</th>
                </tr>
                </thead>
                {libraryItems.map(function fn(libraryItem) {
                    return (
                        <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <th className="px-6 text-left py-4">{libraryItem.id} </th>
                            <td className="px-6 text-left py-4 whitespace-nowrap">{libraryItem.name}</td>
                            <td className="px-6 text-left py-4 whitespace-nowrap">
                                <img src={libraryItem.imageSrc} alt="image picture" className="w-16"/>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={() => props.showForm(libraryItem)}
                                    >Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-red-600 hover:bg-red-900 py-2 text-white px-4 rounded-md"
                                        onClick={() => DeleteLibraryItem(libraryItem.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
}

export default LibraryItem;