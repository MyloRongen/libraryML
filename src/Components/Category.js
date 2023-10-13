import axios from "axios";
import React, {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import {useGoogleLogin} from "@react-oauth/google";

export function LibraryItem() {
    const [content, setContent] = useState(<CategoryList showForm={showForm} showLibraryItems={showLibraryItems}/>);
    const [bearerToken, setToken] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setToken(token);
    },[]);

    function showList(){
        setContent(<CategoryList showForm={showForm} />);
    }

    function showForm(libraryItem){
        setContent(<LibraryItemForm libraryItem={libraryItem} showLibraryItems={showLibraryItems} showList={showList} />);
    }

    function showLibraryItems(category){
        setContent(<LibraryList category={category} showLibraryItems={showLibraryItems} showList={showList} />);
    }

    return (
        <div className="px-20 pt-10">
            {content}
        </div>
    );
}

function LibraryList(props){
    const [libraryItems, setLibraryItems] = useState([]);

    useEffect(() => {
        (async () => await Load())();
    }, [props.category]);

    async function Load() {
        let categoryId = props.category.id;
        let result = await axios.get("https://localhost:7171/api/LibraryItem/GetLibraryItemByCategory", {
            params: {
                categoryId: categoryId
            }
        });

        setLibraryItems(result.data);
        console.log(result.data);
    }

    return(
        <div className="mt-4">
            <h1 className="mt-4 text-4xl">{props.category.name}</h1>

            <form className="pt-6">
                <div className="grid grid-cols-4 min-w-full pt-10">
                    {libraryItems.map(function fn(libraryItem) {
                        return (
                            <div key={libraryItem.id}>
                                <div>
                                    <img src={libraryItem.imageSrc} alt="image picture" className="w-full px-2 xl:px-20 object-cover"/>
                                    <p className="text-center pt-2 text-3xl">{libraryItem.name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </form>
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

function CategoryList(props){
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        (async () => await Load())();
    }, []);

    async function Load() {
        const authToken = localStorage.getItem('accessToken');
        
        let result = await axios.post("https://localhost:7171/api/Category/GetUserCategories", {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        });

        setCategories(result.data);
        console.log(result.data);
    }

    return(
        <div className="pt-10">
            <div className="flex justify-end w-full">
                <button onClick={() => props.showForm({})} className=" bg-blue-400 mb-4 text-white py-2 px-4 rounded-md">Create library item</button>
            </div>

            <div className="grid grid-cols-4 min-w-full pt-10">
                {categories.map(function fn(category) {
                    return (
                        <button
                            key={category.id}
                            type="button"
                            className="btn btn-warning mb-8"
                            onClick={() => props.showLibraryItems(category)}
                        >
                            <div>
                                <img src="https://static-00.iconduck.com/assets.00/folder-icon-2048x1638-vinzc398.png" alt="image picture" className="w-full px-2 xl:px-20" />
                                <p className="text-center pt-2 text-3xl">{category.name}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default LibraryItem;