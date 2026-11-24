import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import api from '../../utils/api';
import { setAddresses } from '../../redux/authSlice';
import AddressForm from '../../components/AddressForm';
import Modal from '../../components/Modal';
import { useT } from '../../i18n';
import useLocations from '../../hooks/useLocations';

export default function Addresses() {
  const dispatch = useDispatch();
  const addresses = useSelector((s) => s.auth.user.addresses);
  const [editing, setEditing] = useState(null); // 'new' | address id
  const [deleting, setDeleting] = useState(null);
  const t = useT();
  const { formatAddress, addressType } = useLocations();

  const save = async (values) => {
    try {
      const { data } = editing === 'new'
        ? await api.post('/users/addresses', values)
        : await api.put(`/users/addresses/${editing}`, values);
      dispatch(setAddresses(data.addresses));
      setEditing(null);
      toast.success(t('Address saved'));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const makeDefault = async (id) => {
    try {
      const { data } = await api.put(`/users/addresses/${id}`, { isDefault: true });
      dispatch(setAddresses(data.addresses));
      toast.success(t('Default address updated'));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const remove = async () => {
    try {
      const { data } = await api.delete(`/users/addresses/${deleting}`);
      dispatch(setAddresses(data.addresses));
      toast.success(t('Address deleted'));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-semibold">{t('Manage Addresses')}</h1>
      {editing === 'new' ? (
        <div className="mb-4 rounded-sm border bg-primary-light/40 p-4">
          <p className="mb-3 text-sm font-semibold uppercase text-primary">{t('Add a new address')}</p>
          <AddressForm onSubmit={save} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <button onClick={() => setEditing('new')} className="mb-4 flex w-full items-center gap-3 rounded-sm border px-4 py-4 text-sm font-semibold uppercase text-primary">
          <FiPlus /> {t('Add a new address')}
        </button>
      )}

      {!addresses.length && editing !== 'new' && <p className="py-6 text-center text-sm text-muted">{t('No saved addresses yet.')}</p>}

      <ul className="divide-y rounded-sm border">
        {addresses.map((a) => (
          <li key={a._id} className="p-4">
            {editing === a._id ? (
              <AddressForm initial={a} onSubmit={save} onCancel={() => setEditing(null)} />
            ) : (
              <div className="flex gap-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-page px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">{addressType(a.type)}</span>
                    {a.isDefault && <span className="rounded-sm bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-success">{t('Default')}</span>}
                  </p>
                  <p className="mt-2 font-semibold">{a.name} <span className="ml-3">{a.phone}</span></p>
                  <p className="mt-1">{formatAddress(a)}</p>
                  {a.landmark && <p className="text-xs text-muted">{t('Landmark')}: {a.landmark}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 text-xs font-semibold uppercase">
                  <button onClick={() => setEditing(a._id)} className="text-primary">{t('Edit')}</button>
                  <button onClick={() => setDeleting(a._id)} className="text-[#ff6161]">{t('Delete')}</button>
                  {!a.isDefault && <button onClick={() => makeDefault(a._id)} className="text-muted">{t('Set default')}</button>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={t('Delete address?')}
        actions={<><button onClick={() => setDeleting(null)} className="btn-outline">{t('Cancel')}</button><button onClick={remove} className="btn-buy">{t('Delete')}</button></>}>
        <p className="text-sm text-muted">{t('Are you sure you want to delete this address?')}</p>
      </Modal>
    </div>
  );
}
