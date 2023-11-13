import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { KEY_LS } from '../../utils/constant';
import { flashCardService } from '../../services';

export const EditSet = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [setItem, setSetItem] = useState({});
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      list: [{ front: '', back: '', image: '' }],
      title: '',
      description: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'list',
  });

  const onSubmit = async (data) => {
    const userId = JSON.parse(localStorage.getItem(KEY_LS.USER_INFO)).id || '';

    if (userId) {
      const dataSet = {
        ...setItem,
        name: data.title,
        description: data.description,
        data: data.list,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      await flashCardService
        .updateSet(dataSet)
        .then(async (res) => {
          if (res.data) {
            toast.success('Update set successfully.');
            navigate(`/set/${res.data.id}`);
          }
        })
        .catch((error) => {
          toast.error('Update set failed.');
        });
    }
  };

  const handleImage = (e) => {
    const files = e.target.files;
    const fileName = files[0].name;
    const element = e.target;
    const index = element.getAttribute('data-id');

    setValue(`list.${index}.image`, fileName);
  };

  const getSetById = async () => {
    if (id) {
      setIsLoading(true);
      await flashCardService
        .getSetById(id)
        .then((res) => {
          if (res.data) {
            setSetItem(res.data);
            setValue('list', res.data.data);
            setValue('title', res.data.name);
            setValue('description', res.data.description);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    getSetById();
  }, []);

  return isLoading ? (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <section className='w-[90%] m-auto'>
      <h2 className='font-bold text-xl text-[#2e3856] mb-8'>
        Edit a study set
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='mb-4 w-full lg:w-6/12'>
          <input
            type='text'
            id='title'
            className='bg-white border-b-2 border-black text-gray-900 focus:border-blue-800 block w-full py-2 focus:outline-none'
            placeholder='Enter a title'
            {...register('title', { required: true })}
          />
          <label
            htmlFor='title'
            className='block mt-2 text-sm font-bold uppercase text-[#939bb4]'
          >
            Title
          </label>
          {errors.title && (
            <span className='text-red-600 text-xs'>Title is required</span>
          )}
        </div>
        <div className='mb-12 w-full lg:w-6/12'>
          <input
            type='text'
            id='description'
            className='bg-white border-b-2 border-black text-gray-900 focus:border-blue-800 block w-full py-2 focus:outline-none'
            placeholder='Add a description'
            {...register('description')}
          />
          <label
            htmlFor='description'
            className='block mt-2 text-sm font-bold uppercase text-[#939bb4]'
          >
            Description
          </label>
        </div>
        {fields.map((field, index) => (
          <div
            className='bg-white rounded shadow py-4 mb-4 relative'
            key={field.id}
          >
            <div className='px-8 pb-4 font-semibold border-b border-gray-300 flex items-center justify-between'>
              <h5 className='text-gray-500'>{index + 1}</h5>
              <button
                onClick={() => remove(index)}
                disabled={index === 0}
                className='disabled:opacity-60'
              >
                <DeleteIcon></DeleteIcon>
              </button>
            </div>
            <div className='flex items-center justify-between px-8 py-4 gap-8'>
              <div className='w-full'>
                <input
                  placeholder='Enter term'
                  className='py-2 border-b-2 border-gray-800 focus:border-blue-800 focus:outline-none w-full'
                  {...register(`list.${index}.front`, { required: true })}
                />
                <label className='block mt-2 text-xs font-bold uppercase text-[#939bb4]'>
                  Term
                </label>
                {errors.list && errors.list[index].front && (
                  <span className='text-red-600 text-xs'>Term is required</span>
                )}
              </div>
              <div className='w-full'>
                <input
                  className='py-2 border-b-2 border-gray-800 focus:border-blue-800 focus:outline-none w-full'
                  placeholder='Enter definition'
                  {...register(`list.${index}.back`, { required: true })}
                />
                <label className='block mt-2 text-xs font-bold uppercase text-[#939bb4]'>
                  Definition
                </label>
                {errors.list && errors.list[index].back && (
                  <span className='text-red-600 text-xs'>
                    Definition is required
                  </span>
                )}
              </div>
              <div className='flex'>
                <label className='w-[84px] flex flex-col items-center bg-white text-blue rounded-lg tracking-wide uppercase border border-dashed cursor-pointer hover:border-yellow-300 py-1'>
                  <CloudUploadIcon></CloudUploadIcon>
                  <span className='text-xs leading-normal'>Image</span>
                  <input
                    data-id={index}
                    type='file'
                    className='hidden'
                    onChange={handleImage}
                  />
                </label>
              </div>
            </div>
            <div className='btn-box'>
              {fields.length - 1 === index && (
                <button
                  className='w-9 h-9 rounded-full bg-blue-800 flex justify-center items-center absolute left-[50%] translate-x-[-50%]'
                  onClick={() => append({ front: '', back: '', image: '' })}
                >
                  <AddIcon style={{ color: 'white' }}></AddIcon>
                </button>
              )}
            </div>
          </div>
        ))}
        <div className='w-full text-end mt-5'>
          <button className='bg-blue-800 text-white px-6 py-2 rounded-md text-lg mb-20'>
            Edit
          </button>
        </div>
      </form>
    </section>
  );
};
