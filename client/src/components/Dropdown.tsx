import styled from 'styled-components';
import { colors } from './Color';

interface Item {
  idx: number;
  name: string;
  color?: keyof typeof colors;
}

interface Props {
  items: Item[];
  select: number;
  handleChange?: React.MouseEventHandler<HTMLDivElement>;
  left?: string;
  width?: string;
  top?: string;
}

export const Dropdown = (props: Props) => {
  return (
    <DropdownWrapper left={props.left} width={props.width} top={props.top}>
      {props.items.map((item) => {
        if (item.idx !== props.select) {
          return (
            <DropdownItemStyle
              key={item.idx}
              data-idx={item.idx}
              onMouseDown={props.handleChange}
              color={item.color}
            >
              {item.name}
            </DropdownItemStyle>
          );
        }
        return null;
      })}
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div<{
  left: string | undefined;
  width: string | undefined;
  top: string | undefined;
}>`
  position: absolute;
  z-index: 100;
  top: ${({ top }) => (top ? `${top}px` : '50px')};
  ${({ left }) => (left ? `left: ${left}px;` : '')}
  ${({ width }) => (width ? `width: ${width}px;` : '')}

  background: ${colors.gray3};
  border: 1px solid ${colors.gray3};
  box-shadow: 0px 0px 4px rgba(204, 204, 204, 0.5),
    0px 2px 4px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  overflow: hidden;
`;

const DropdownItemStyle = styled.div<{ color?: keyof typeof colors }>`
  cursor: pointer;
  padding: 16px;
  background: ${colors.offWhite};

  color: ${({ color }) => (color ? colors[color] : colors.titleActive)};

  &:not(last-child) {
    border-bottom: 1px solid ${colors.gray3};
  }
`;
