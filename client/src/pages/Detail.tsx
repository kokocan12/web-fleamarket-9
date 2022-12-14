import { AxiosError } from 'axios';
import { instance } from '../utils/instance';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  Button,
  Dropdown,
  InfoSaler,
  ItemDetailSkeleton,
  ProductBar,
  Spacing,
  StatusButton,
  TypoGraphy,
} from '../components/Base';
import { useAuthContext, useItemDetail, useLikeNotify } from '../hooks';
import { colors } from '../components/Color';
import { InvisibleHeader } from '../components/Header/InvisibleHeader';
import { elapsedTime, listenForOutsideClicks } from '../utils/util';
import { ImageSlide } from '../components/Base/ImageSlide';

const status = [
  { idx: 1, name: '판매중' },
  { idx: 2, name: '예약중' },
  { idx: 3, name: '판매완료' },
];

interface DropdownItem {
  idx: number;
  name: string;
  color?: keyof typeof colors;
}

const dropdownItems: DropdownItem[] = [
  { idx: 1, name: '수정하기' },
  { idx: 99999, name: '삭제하기', color: 'red' },
];

export const Detail = () => {
  const { id } = useParams();

  const {
    item,
    isLoading: isDetailLoading,
  }: { item: any; isLoading: boolean } = useItemDetail(id);

  const [currentStatus, setCurrentStatus] = useState(item.status | 1);
  const [openStatus, setOpenStatus] = useState(false);
  const [like, setLike] = useState(item.isLike);
  const [openMore, setOpenMore] = useState(false);
  const { notify: notifyItemLike } = useLikeNotify();

  const { user, isLoggedIn } = useAuthContext('Detail');
  const navigate = useNavigate();

  useEffect(() => {
    if (item.constructor === Object && Object.keys(item).length === 0) {
    } else {
      setLike(item.isLike);
      setCurrentStatus(item.status);
    }
  }, [item]);

  const statusRef = useRef(null);
  const [listening, setListening] = useState(false);
  useEffect(
    listenForOutsideClicks({
      listening,
      setListening,
      menuRef: statusRef,
      setIsOpen: setOpenStatus,
    }),
  );

  const moreRef = useRef(null);
  const [listeningMore, setListeningMore] = useState(false);
  useEffect(
    listenForOutsideClicks({
      listening: listeningMore,
      setListening: setListeningMore,
      menuRef: moreRef,
      setIsOpen: setOpenMore,
    }),
  );

  const onDropDownMenuClick = (num: number) => {
    switch (num) {
      // 수정하기
      case 1:
        navigate(`/item/edit/${id}`);
        break;

      // 삭제하기
      case 99999:
        deleteItem(id);

        break;
    }
  };

  const deleteItem = async (itemId: string | undefined) => {
    try {
      if (
        !window.confirm(
          '아이템을 삭제하시겠습니까?\n아이템과 관련된 채팅 내용이 모두 사라집니다.',
        )
      ) {
        return;
      }

      await instance.delete(`/api/item/${itemId}`);
      alert('아이템을 삭제했습니다.');
      navigate(-1);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err.response?.data.message);
      }
    }
  };

  const handleStatusToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpenStatus((prevOpenStatus) => !prevOpenStatus);
  };

  const handleStatusChange = (num: number) => {
    try {
      instance.patch(`/api/item/status/${id}`, {
        statusId: num,
      });
    } catch (err) {}
    setOpenStatus((prevOpenStatus) => !prevOpenStatus);
    setCurrentStatus(num);
  };

  const handleClickLike = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoggedIn) {
      if (window.confirm('로그인 이후에 가능합니다.\n로그인 하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (like) {
      instance.patch(`/api/item/unlike/${id}`);
    } else {
      instance.patch(`/api/item/like/${id}`);
      notifyItemLike(+id!);
    }

    setLike((prevLike: any) => !prevLike);
  };

  const getChatRoomIdx = async (itemId: number) => {
    try {
      const { data } = await instance.post(`/api/chat`, {
        sellerId: item.seller,
        buyerId: user?.idx,
        itemId,
      });
      return data.chatId;
    } catch (err) {}
  };

  const handleClickChat = async (owner: boolean, id: string) => {
    if (!isLoggedIn) {
      if (window.confirm('로그인 이후에 가능합니다.\n로그인 하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (owner) {
      navigate(`/chat?itemId=${id}`);
    } else {
      const chatId = await getChatRoomIdx(+id);
      navigate(`/chat/${chatId}`);
    }
  };

  if (!id) {
    return null;
  }

  const owner = user?.idx === item.seller;

  interface ButtonProps {
    size?: 'md' | 'lg';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }
  const buttonProps: ButtonProps = {
    size: 'md',
    onClick: () => handleClickChat(owner, id),
  };

  return (
    <DetailWrapper>
      {isDetailLoading ? (
        <ItemDetailSkeleton></ItemDetailSkeleton>
      ) : (
        <>
          <HeaderWrapper>
            <InvisibleHeader
              onClickBack={() => navigate(-1)}
              onClickMore={() => {
                setOpenMore((prevOpenMore) => !prevOpenMore);
              }}
              ref={moreRef}
              visibleMore={owner}
            />
            {openMore && (
              <Dropdown
                width="100"
                top="20"
                right="20"
                items={dropdownItems}
                select={0}
                handleChange={onDropDownMenuClick}
              ></Dropdown>
            )}
          </HeaderWrapper>

          <BodyWrapper>
            <ImageSlide images={item.images}></ImageSlide>
            <ContentWrapper>
              {owner && (
                <StatusButton
                  ref={statusRef}
                  status={status}
                  select={currentStatus}
                  open={openStatus}
                  handleToggle={handleStatusToggle}
                  handleChange={handleStatusChange}
                ></StatusButton>
              )}
              <Spacing height={16}></Spacing>
              <TypoGraphy.Large>{item.title}</TypoGraphy.Large>
              <DataWrapper>
                <span>{item.categoryName}</span>
                <span>·{elapsedTime(item.updatedAt)}</span>
              </DataWrapper>
              <DescriptionWrapper>{item.contents}</DescriptionWrapper>
              <DataWrapper>
                채팅 {item.chatRoomCount}·관심 {item.likeCount}·조회{' '}
                {item.viewCount}
              </DataWrapper>
              <InfoSaler
                location={item.location}
                username={item.sellerName}
              ></InfoSaler>
            </ContentWrapper>
          </BodyWrapper>
          <FooterWrapper>
            <HorizontalBar />
            <ProductBar
              onLikeClick={handleClickLike}
              isLiked={like}
              price={item.price ? Number(item.price).toLocaleString() : ''}
              Button={
                <Button
                  {...buttonProps}
                  {...(owner && item.chatRoomCount === 0
                    ? { disabled: true }
                    : {})}
                >
                  {owner
                    ? `채팅${
                        item.chatRoomCount > 0 ? ` (${item.chatRoomCount})` : ''
                      }`
                    : '문의하기'}
                </Button>
              }
            />
          </FooterWrapper>
        </>
      )}
    </DetailWrapper>
  );
};

const DetailWrapper = styled.div`
  width: 100%;
  max-width: 100%;

  @supports (-webkit-touch-callout: none) {
    max-height: -webkit-fill-available;
  }

  box-sizing: border-box;
`;

const HeaderWrapper = styled.div`
  position: sticky;
  width: 100%;
  z-index: 9;
  top: 0;
`;

const BodyWrapper = styled.div`
  box-sizing: border-box;

  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  width: 100%;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  padding: 24px 16px 116px 16px;
`;

const DataWrapper = styled.div`
  color: ${colors.gray1};
  font-size: 12px;
  line-height: 16px;

  margin-top: 8px;
  margin-bottom: 16px;
`;

const DescriptionWrapper = styled.div`
  color: ${colors.titleActive};
  font-size: 16px;
  line-height: 24px;
  word-break: keep-all;
  word-wrap: break-word;
  margin: 16px 0;
  white-space: pre-wrap;
`;
const HorizontalBar = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${colors.gray3};
`;

const FooterWrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
`;
